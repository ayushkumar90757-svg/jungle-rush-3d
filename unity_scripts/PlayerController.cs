using System.Collections;
using UnityEngine;

namespace JungleRush3D
{
    /// <summary>
    /// Production-grade 3D Runner Player Controller for Unity.
    /// Handles 3-lane lateral switching, jump with gravity curves, slide with dynamic collider resizing,
    /// touch swipe gestures, and power-up invulnerability.
    /// </summary>
    [RequireComponent(typeof(CharacterController))]
    public class PlayerController : MonoBehaviour
    {
        public static PlayerController Instance { get; private set; }

        [Header("Lane Settings")]
        [Tooltip("Lateral distance between left, center, and right lanes")]
        public float laneDistance = 2.5f;
        [Tooltip("Speed of lateral lane switching")]
        public float laneSwitchSpeed = 16.0f;

        [Header("Speed & Progression")]
        public float startSpeed = 16.0f;
        public float maxSpeed = 32.0f;
        public float speedIncreaseRate = 0.008f; // per meter
        public float currentSpeed;

        [Header("Jump & Physics")]
        public float jumpForce = 13.5f;
        public float gravity = -34.0f;
        public LayerMask groundLayer;

        [Header("Slide Settings")]
        public float slideDuration = 0.75f;
        public float normalHeight = 1.9f;
        public float slideHeight = 0.65f;
        public Vector3 normalCenter = new Vector3(0, 0.95f, 0);
        public Vector3 slideCenter = new Vector3(0, 0.35f, 0);

        [Header("Visuals & Audio")]
        public Animator animator;
        public GameObject shieldVisual;
        public ParticleSystem slideDustParticles;

        // Lane state (-1: Left, 0: Center, 1: Right)
        private int currentLane = 0;
        private float targetX = 0f;
        private Vector3 moveDirection = Vector3.zero;
        private float verticalVelocity = 0f;

        private CharacterController characterController;
        private bool isSliding = false;
        private Coroutine slideCoroutine;

        // Stats
        public float DistanceTraveled { get; private set; }
        public int CoinsCollected { get; set; }
        public bool IsDead { get; private set; }
        public bool IsInvulnerable { get; private set; }

        // Touch Input variables
        private Vector2 touchStartPos;
        private float touchStartTime;
        private const float MinSwipeDistance = 40f;
        private const float MaxSwipeDuration = 0.4f;

        // Animator Hashes for zero-string overhead
        private static readonly int HashSpeed = Animator.StringToHash("Speed");
        private static readonly int HashJump = Animator.StringToHash("Jump");
        private static readonly int HashSlide = Animator.StringToHash("Slide");
        private static readonly int HashDead = Animator.StringToHash("Dead");

        private void Awake()
        {
            if (Instance == null) Instance = this;
            else Destroy(gameObject);

            characterController = GetComponent<CharacterController>();
        }

        private void Start()
        {
            ResetPlayer();
        }

        public void ResetPlayer()
        {
            currentLane = 0;
            targetX = 0f;
            currentSpeed = startSpeed;
            DistanceTraveled = 0f;
            CoinsCollected = 0;
            verticalVelocity = 0f;
            IsDead = false;
            IsInvulnerable = false;
            isSliding = false;

            transform.position = Vector3.zero;
            characterController.height = normalHeight;
            characterController.center = normalCenter;

            if (shieldVisual) shieldVisual.SetActive(false);
            if (animator)
            {
                animator.Rebind();
                animator.Update(0f);
            }
        }

        private void Update()
        {
            if (IsDead || GameManager.Instance.CurrentState != GameState.Playing) return;

            HandleInput();
            UpdateMovement();
            UpdateSpeed();
        }

        private void HandleInput()
        {
            // 1. Mobile Touch Swipes
            if (Input.touchCount > 0)
            {
                Touch touch = Input.GetTouch(0);
                if (touch.phase == TouchPhase.Began)
                {
                    touchStartPos = touch.position;
                    touchStartTime = Time.time;
                }
                else if (touch.phase == TouchPhase.Ended)
                {
                    Vector2 delta = touch.position - touchStartPos;
                    float duration = Time.time - touchStartTime;

                    if (delta.magnitude >= MinSwipeDistance && duration <= MaxSwipeDuration)
                    {
                        if (Mathf.Abs(delta.x) > Mathf.Abs(delta.y))
                        {
                            if (delta.x > 0) MoveLane(1);
                            else MoveLane(-1);
                        }
                        else
                        {
                            if (delta.y > 0) Jump();
                            else Slide();
                        }
                    }
                }
            }

            // 2. Keyboard fallback (A/D or Arrows)
            if (Input.GetKeyDown(KeyCode.LeftArrow) || Input.GetKeyDown(KeyCode.A)) MoveLane(-1);
            if (Input.GetKeyDown(KeyCode.RightArrow) || Input.GetKeyDown(KeyCode.D)) MoveLane(1);
            if (Input.GetKeyDown(KeyCode.UpArrow) || Input.GetKeyDown(KeyCode.W) || Input.GetKeyDown(KeyCode.Space)) Jump();
            if (Input.GetKeyDown(KeyCode.DownArrow) || Input.GetKeyDown(KeyCode.S)) Slide();
        }

        public void MoveLane(int direction)
        {
            int nextLane = Mathf.Clamp(currentLane + direction, -1, 1);
            if (nextLane != currentLane)
            {
                currentLane = nextLane;
                targetX = currentLane * laneDistance;
                AudioManager.Instance.PlaySFX("footstep");
            }
        }

        public void Jump()
        {
            if (characterController.isGrounded)
            {
                verticalVelocity = jumpForce;
                if (isSliding) StopSlide();

                if (animator) animator.SetTrigger(HashJump);
                AudioManager.Instance.PlaySFX("jump");
            }
        }

        public void Slide()
        {
            if (!characterController.isGrounded)
            {
                // Quick downward dive if in mid-air
                verticalVelocity = -jumpForce * 1.5f;
            }

            if (!isSliding)
            {
                slideCoroutine = StartCoroutine(SlideRoutine());
            }
        }

        private IEnumerator SlideRoutine()
        {
            isSliding = true;
            characterController.height = slideHeight;
            characterController.center = slideCenter;

            if (animator) animator.SetTrigger(HashSlide);
            if (slideDustParticles) slideDustParticles.Play();
            AudioManager.Instance.PlaySFX("slide");

            yield return new WaitForSeconds(slideDuration);

            StopSlide();
        }

        private void StopSlide()
        {
            if (slideCoroutine != null) StopCoroutine(slideCoroutine);
            characterController.height = normalHeight;
            characterController.center = normalCenter;
            isSliding = false;
        }

        private void UpdateMovement()
        {
            // Lateral Smooth Lerp
            Vector3 currentPos = transform.position;
            float newX = Mathf.Lerp(currentPos.x, targetX, Time.deltaTime * laneSwitchSpeed);

            // Vertical Gravity
            if (characterController.isGrounded && verticalVelocity < 0)
            {
                verticalVelocity = -1f; // Ground snap
            }
            else
            {
                verticalVelocity += gravity * Time.deltaTime;
            }

            // Forward advance
            float forwardDelta = currentSpeed * Time.deltaTime;
            DistanceTraveled += forwardDelta;

            moveDirection = new Vector3(newX - currentPos.x, verticalVelocity * Time.deltaTime, forwardDelta);
            characterController.Move(moveDirection);

            // Update Animator speed ratio
            if (animator)
            {
                animator.SetFloat(HashSpeed, currentSpeed / startSpeed);
            }
        }

        private void UpdateSpeed()
        {
            float target = startSpeed + (DistanceTraveled * speedIncreaseRate);
            if (PowerUpManager.Instance.IsBoostActive) target *= 1.6f;
            currentSpeed = Mathf.Min(target, maxSpeed);
        }

        public bool HitObstacle()
        {
            if (IsInvulnerable || PowerUpManager.Instance.IsBoostActive) return false;

            if (PowerUpManager.Instance.IsShieldActive)
            {
                PowerUpManager.Instance.DeactivateShield();
                StartCoroutine(TemporaryInvulnerability(1.2f));
                AudioManager.Instance.PlaySFX("shield_break");
                return false;
            }

            // Fatal crash
            IsDead = true;
            if (animator) animator.SetTrigger(HashDead);
            AudioManager.Instance.PlaySFX("crash");
            GameManager.Instance.OnPlayerDied();
            return true;
        }

        private IEnumerator TemporaryInvulnerability(float duration)
        {
            IsInvulnerable = true;
            yield return new WaitForSeconds(duration);
            IsInvulnerable = false;
        }

        public void SetShieldVisual(bool active)
        {
            if (shieldVisual) shieldVisual.SetActive(active);
        }
    }
}
