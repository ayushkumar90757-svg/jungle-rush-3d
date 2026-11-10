using UnityEngine;

namespace JungleRush3D
{
    /// <summary>
    /// Collectible 3D Gold Aztec Medallion with magnetic pull and rotation.
    /// </summary>
    public class Coin : MonoBehaviour
    {
        public float rotationSpeed = 120.0f;
        public float magnetFlySpeed = 26.0f;
        public string poolTag = "Coin";

        private Transform playerTransform;

        private void Start()
        {
            if (PlayerController.Instance) playerTransform = PlayerController.Instance.transform;
        }

        private void Update()
        {
            // Spin
            transform.Rotate(0, rotationSpeed * Time.deltaTime, 0, Space.World);

            // Magnet attraction
            if (PowerUpManager.Instance && PowerUpManager.Instance.IsMagnetActive && playerTransform)
            {
                float dist = Vector3.Distance(transform.position, playerTransform.position);
                if (dist < PowerUpManager.Instance.MagnetRadius)
                {
                    transform.position = Vector3.MoveTowards(
                        transform.position,
                        playerTransform.position + Vector3.up * 0.9f,
                        magnetFlySpeed * Time.deltaTime
                    );
                }
            }
        }

        private void OnTriggerEnter(Collider other)
        {
            if (other.CompareTag("Player"))
            {
                int multiplier = PowerUpManager.Instance.IsMultiplierActive ? 2 : 1;
                PlayerController.Instance.CoinsCollected += 1 * multiplier;

                AudioManager.Instance.PlaySFX("coin");
                ObjectPooler.Instance.ReturnToPool(poolTag, gameObject);
            }
        }
    }
}
