using UnityEngine;

namespace JungleRush3D
{
    public enum ObstacleType { LowJump, HighSlide, FullBlocker }

    /// <summary>
    /// Obstacle component with trigger detection and collision response.
    /// </summary>
    public class Obstacle : MonoBehaviour
    {
        public ObstacleType obstacleType;
        public string poolTag = "Obstacle_Log";
        public ParticleSystem destructionParticles;

        private void OnTriggerEnter(Collider other)
        {
            if (other.CompareTag("Player"))
            {
                bool hitDeadly = PlayerController.Instance.HitObstacle();

                if (!hitDeadly)
                {
                    // Shattered by Shield or Boost
                    if (destructionParticles)
                    {
                        destructionParticles.transform.parent = null;
                        destructionParticles.Play();
                    }
                    ObjectPooler.Instance.ReturnToPool(poolTag, gameObject);
                }
            }
        }
    }
}
