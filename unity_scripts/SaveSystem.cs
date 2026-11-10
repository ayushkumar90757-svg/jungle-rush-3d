using System;
using UnityEngine;

namespace JungleRush3D
{
    [Serializable]
    public class GameSaveData
    {
        public int coins = 500;
        public int highScore = 0;
        public int bestDistance = 0;
        public string selectedCharacter = "dash";
        public int magnetLevel = 1;
        public int shieldLevel = 1;
        public int boostLevel = 1;
        public int multiplierLevel = 1;
    }

    /// <summary>
    /// Robust JSON-based Save System using PlayerPrefs / Local File storage.
    /// </summary>
    public static class SaveSystem
    {
        private const string SAVE_KEY = "JUNGLE_RUSH_SAVE_V1";
        private static GameSaveData cachedData;

        public static GameSaveData Load()
        {
            if (cachedData != null) return cachedData;

            if (PlayerPrefs.HasKey(SAVE_KEY))
            {
                string json = PlayerPrefs.GetString(SAVE_KEY);
                try
                {
                    cachedData = JsonUtility.FromJson<GameSaveData>(json);
                }
                catch
                {
                    cachedData = new GameSaveData();
                }
            }
            else
            {
                cachedData = new GameSaveData();
            }

            return cachedData;
        }

        public static void Save()
        {
            if (cachedData == null) Load();
            string json = JsonUtility.ToJson(cachedData);
            PlayerPrefs.SetString(SAVE_KEY, json);
            PlayerPrefs.Save();
        }

        public static int GetCoins() => Load().coins;
        public static int GetHighScore() => Load().highScore;

        public static void AddCoins(int amount)
        {
            Load().coins += amount;
            Save();
        }

        public static bool SpendCoins(int amount)
        {
            if (Load().coins >= amount)
            {
                Load().coins -= amount;
                Save();
                return true;
            }
            return false;
        }

        public static bool RecordRun(int score, int distance, int coinsEarned)
        {
            var data = Load();
            bool isNewHigh = false;

            if (score > data.highScore)
            {
                data.highScore = score;
                isNewHigh = true;
            }

            if (distance > data.bestDistance)
            {
                data.bestDistance = distance;
            }

            data.coins += coinsEarned;
            Save();

            return isNewHigh;
        }
    }
}
