using System.Collections.Generic;
using UnityEngine;

namespace JungleRush3D
{
    /// <summary>
    /// High-performance Object Pooler for Unity.
    /// Eliminates garbage collection and runtime Instantiation spikes.
    /// </summary>
    public class ObjectPooler : MonoBehaviour
    {
        public static ObjectPooler Instance { get; private set; }

        [System.Serializable]
        public class PoolItem
        {
            public string tag;
            public GameObject prefab;
            public int size = 15;
            public bool shouldExpand = false;
        }

        public List<PoolItem> itemsToPool;
        private Dictionary<string, Queue<GameObject>> poolDictionary;

        private void Awake()
        {
            if (Instance == null) Instance = this;
            else Destroy(gameObject);

            InitializePools();
        }

        private void InitializePools()
        {
            poolDictionary = new Dictionary<string, Queue<GameObject>>();

            foreach (var item in itemsToPool)
            {
                Queue<GameObject> objectPool = new Queue<GameObject>();

                for (int i = 0; i < item.size; i++)
                {
                    GameObject obj = Instantiate(item.prefab, transform);
                    obj.SetActive(false);
                    objectPool.Enqueue(obj);
                }

                poolDictionary.Add(item.tag, objectPool);
            }
        }

        public GameObject SpawnFromPool(string tag, Vector3 position, Quaternion rotation)
        {
            if (!poolDictionary.ContainsKey(tag))
            {
                Debug.LogWarning($"Pool with tag '{tag}' doesn't exist.");
                return null;
            }

            Queue<GameObject> pool = poolDictionary[tag];
            GameObject objToSpawn = null;

            if (pool.Count > 0)
            {
                objToSpawn = pool.Dequeue();
            }
            else
            {
                // Find pool config
                PoolItem item = itemsToPool.Find(p => p.tag == tag);
                if (item != null && item.shouldExpand)
                {
                    objToSpawn = Instantiate(item.prefab, transform);
                }
                else
                {
                    Debug.LogWarning($"Pool '{tag}' is exhausted and cannot expand.");
                    return null;
                }
            }

            objToSpawn.transform.position = position;
            objToSpawn.transform.rotation = rotation;
            objToSpawn.SetActive(true);

            return objToSpawn;
        }

        public void ReturnToPool(string tag, GameObject obj)
        {
            obj.SetActive(false);
            if (poolDictionary.ContainsKey(tag))
            {
                poolDictionary[tag].Enqueue(obj);
            }
        }
    }
}
