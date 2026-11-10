using System.Collections.Generic;
using UnityEngine;

namespace JungleRush3D
{
    /// <summary>
    /// Endless chunk spawner with automatic recycling, obstacle placement, and coin arcs.
    /// </summary>
    public class TrackManager : MonoBehaviour
    {
        public static TrackManager Instance { get; private set; }

        [Header("Chunk Settings")]
        public float chunkLength = 50.0f;
        public int activeChunksCount = 7;
        public float safeStartDistance = 100.0f;

        private float spawnZ = 0f;
        private List<GameObject> activeChunks = new List<GameObject>();
        private Transform playerTransform;

        private void Awake()
        {
            if (Instance == null) Instance = this;
            else Destroy(gameObject);
        }

        private void Start()
        {
            playerTransform = PlayerController.Instance.transform;
            ResetTrack();
        }

        public void ResetTrack()
        {
            // Return all active chunks to pool
            foreach (var chunk in activeChunks)
            {
                ObjectPooler.Instance.ReturnToPool("TrackChunk", chunk);
            }
            activeChunks.Clear();

            spawnZ = 0f;

            for (int i = 0; i < activeChunksCount; i++)
            {
                SpawnNextChunk(i < 2); // First 2 chunks are safe
            }
        }

        private void Update()
        {
            if (playerTransform == null || GameManager.Instance.CurrentState != GameState.Playing) return;

            // Recycle oldest chunk when player passes it
            if (playerTransform.position.z - 40.0f > (spawnZ - activeChunksCount * chunkLength))
            {
                SpawnNextChunk(false);
                RecycleOldestChunk();
            }
        }

        private void SpawnNextChunk(bool isSafe)
        {
            GameObject chunk = ObjectPooler.Instance.SpawnFromPool(
                "TrackChunk",
                new Vector3(0, 0, spawnZ),
                Quaternion.identity
            );

            if (chunk != null)
            {
                activeChunks.Add(chunk);

                // Populate obstacles & collectibles if not safe zone
                if (!isSafe)
                {
                    PopulateChunkContent(spawnZ);
                }
                else
                {
                    SpawnCoinLine(0, spawnZ + 15f, 5);
                }
            }

            spawnZ += chunkLength;
        }

        private void RecycleOldestChunk()
        {
            if (activeChunks.Count > 0)
            {
                GameObject oldest = activeChunks[0];
                activeChunks.RemoveAt(0);
                ObjectPooler.Instance.ReturnToPool("TrackChunk", oldest);
            }
        }

        private void PopulateChunkContent(float baseZ)
        {
            // Spawn 2 obstacle encounters per 50m chunk
            float[] offsets = { 15f, 35f };
            float[] lanes = { -2.5f, 0f, 2.5f };

            foreach (var offset in offsets)
            {
                float z = baseZ + offset;
                float pattern = Random.value;

                if (pattern < 0.3f)
                {
                    // Low obstacle (jump)
                    int lane = Random.Range(0, 3);
                    ObjectPooler.Instance.SpawnFromPool("Obstacle_Log", new Vector3(lanes[lane], 0, z), Quaternion.identity);
                    SpawnCoinArc(lanes[lane], z);
                }
                else if (pattern < 0.6f)
                {
                    // High obstacle (slide)
                    int lane = Random.Range(0, 3);
                    ObjectPooler.Instance.SpawnFromPool("Obstacle_Arch", new Vector3(lanes[lane], 0, z), Quaternion.identity);
                    SpawnCoinLine(lanes[lane], z - 2f, 4);
                }
                else
                {
                    // Boulder (evade)
                    int blockedLane = Random.Range(0, 3);
                    ObjectPooler.Instance.SpawnFromPool("Obstacle_Boulder", new Vector3(lanes[blockedLane], 0, z), Quaternion.identity);
                    int openLane = (blockedLane + 1) % 3;
                    SpawnCoinLine(lanes[openLane], z - 4f, 5);
                }
            }

            // Power-up spawn chance
            if (Random.value < 0.25f)
            {
                int pLane = Random.Range(0, 3);
                string[] pTags = { "PowerUp_Magnet", "PowerUp_Shield", "PowerUp_Boost", "PowerUp_Multiplier" };
                string chosenTag = pTags[Random.Range(0, pTags.Length)];
                ObjectPooler.Instance.SpawnFromPool(chosenTag, new Vector3(lanes[pLane], 1f, baseZ + 25f), Quaternion.identity);
            }
        }

        public void SpawnCoinLine(float laneX, float startZ, int count)
        {
            for (int i = 0; i < count; i++)
            {
                ObjectPooler.Instance.SpawnFromPool("Coin", new Vector3(laneX, 0.5f, startZ + (i * 2.5f)), Quaternion.identity);
            }
        }

        public void SpawnCoinArc(float laneX, float centerZ)
        {
            int count = 5;
            float spacing = 2.2f;
            float startZ = centerZ - (spacing * 2);

            for (int i = 0; i < count; i++)
            {
                float t = (float)i / (count - 1) * 2f - 1f;
                float y = 0.5f + (1f - t * t) * 1.8f;
                ObjectPooler.Instance.SpawnFromPool("Coin", new Vector3(laneX, y, startZ + (i * spacing)), Quaternion.identity);
            }
        }
    }
}
