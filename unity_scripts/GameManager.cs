using UnityEngine;

namespace JungleRush3D
{
    public enum GameState { Menu, Playing, Paused, GameOver }

    /// <summary>
    /// Master Game Controller for Jungle Rush 3D in Unity.
    /// Handles game states, run lifecycle, score tabulation, and time scale.
    /// </summary>
    public class GameManager : MonoBehaviour
    {
        public static GameManager Instance { get; private set; }

        public GameState CurrentState { get; private set; } = GameState.Menu;

        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
                DontDestroyOnLoad(gameObject);
            }
            else
            {
                Destroy(gameObject);
            }
        }

        private void Start()
        {
            Time.timeScale = 1.0f;
            CurrentState = GameState.Menu;
            UIManager.Instance.ShowMenu();
        }

        public void StartGame()
        {
            CurrentState = GameState.Playing;
            Time.timeScale = 1.0f;

            PlayerController.Instance.ResetPlayer();
            TrackManager.Instance.ResetTrack();
            PowerUpManager.Instance.ResetPowerUps();

            UIManager.Instance.ShowHUD();
            AudioManager.Instance.PlayMusic("jungle_bgm");
        }

        public void PauseGame()
        {
            if (CurrentState != GameState.Playing) return;

            CurrentState = GameState.Paused;
            Time.timeScale = 0f;
            UIManager.Instance.ShowPause();
        }

        public void ResumeGame()
        {
            if (CurrentState != GameState.Paused) return;

            CurrentState = GameState.Playing;
            Time.timeScale = 1.0f;
            UIManager.Instance.ShowHUD();
        }

        public void OnPlayerDied()
        {
            CurrentState = GameState.GameOver;
            AudioManager.Instance.StopMusic();

            float dist = PlayerController.Instance.DistanceTraveled;
            int coins = PlayerController.Instance.CoinsCollected;
            int finalScore = Mathf.FloorToInt(dist * 10f + coins * 50f);

            bool isNewHigh = SaveSystem.RecordRun(finalScore, Mathf.FloorToInt(dist), coins);

            StartCoroutine(ShowGameOverDelay(finalScore, dist, coins, isNewHigh));
        }

        private System.Collections.IEnumerator ShowGameOverDelay(int score, float dist, int coins, bool isNewHigh)
        {
            yield return new WaitForSeconds(1.2f);
            UIManager.Instance.ShowGameOver(score, dist, coins, isNewHigh);
        }

        public void ReturnToMenu()
        {
            Time.timeScale = 1.0f;
            CurrentState = GameState.Menu;
            AudioManager.Instance.StopMusic();

            PlayerController.Instance.ResetPlayer();
            TrackManager.Instance.ResetTrack();

            UIManager.Instance.ShowMenu();
        }
    }
}
