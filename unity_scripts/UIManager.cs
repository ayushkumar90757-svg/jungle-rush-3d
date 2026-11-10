using UnityEngine;
using UnityEngine.UI;

namespace JungleRush3D
{
    /// <summary>
    /// Professional UI Controller for Unity Canvas.
    /// Controls HUD, Pause, GameOver, Shop, Character Selection, and Settings.
    /// </summary>
    public class UIManager : MonoBehaviour
    {
        public static UIManager Instance { get; private set; }

        [Header("Screen Panels")]
        public GameObject menuPanel;
        public GameObject hudPanel;
        public GameObject pausePanel;
        public GameObject gameOverPanel;
        public GameObject shopPanel;
        public GameObject charactersPanel;
        public GameObject settingsPanel;

        [Header("HUD Elements")]
        public Text scoreText;
        public Text coinsText;
        public Text distanceText;

        [Header("Game Over Elements")]
        public Text goScoreText;
        public Text goCoinsText;
        public Text goDistanceText;
        public GameObject newHighBadge;

        [Header("Menu Stats")]
        public Text menuBankCoinsText;
        public Text menuHighScoreText;

        private void Awake()
        {
            if (Instance == null) Instance = this;
            else Destroy(gameObject);
        }

        private void Update()
        {
            if (GameManager.Instance.CurrentState == GameState.Playing)
            {
                float dist = PlayerController.Instance.DistanceTraveled;
                int coins = PlayerController.Instance.CoinsCollected;
                int score = Mathf.FloorToInt(dist * 10f + coins * 50f);

                if (scoreText) scoreText.text = score.ToString("N0");
                if (coinsText) coinsText.text = coins.ToString("N0");
                if (distanceText) distanceText.text = $"{Mathf.FloorToInt(dist)}m";
            }
        }

        public void ShowMenu()
        {
            HideAllPanels();
            if (menuPanel) menuPanel.SetActive(true);

            if (menuBankCoinsText) menuBankCoinsText.text = SaveSystem.GetCoins().ToString("N0");
            if (menuHighScoreText) menuHighScoreText.text = SaveSystem.GetHighScore().ToString("N0");
        }

        public void ShowHUD()
        {
            HideAllPanels();
            if (hudPanel) hudPanel.SetActive(true);
        }

        public void ShowPause()
        {
            if (pausePanel) pausePanel.SetActive(true);
        }

        public void ShowGameOver(int score, float distance, int coins, bool isNewHigh)
        {
            HideAllPanels();
            if (gameOverPanel) gameOverPanel.SetActive(true);

            if (goScoreText) goScoreText.text = score.ToString("N0");
            if (goDistanceText) goDistanceText.text = $"{Mathf.FloorToInt(distance)}m";
            if (goCoinsText) goCoinsText.text = $"+{coins:N0}";
            if (newHighBadge) newHighBadge.SetActive(isNewHigh);
        }

        public void ShowShop()
        {
            HideAllPanels();
            if (shopPanel) shopPanel.SetActive(true);
        }

        public void ShowCharacters()
        {
            HideAllPanels();
            if (charactersPanel) charactersPanel.SetActive(true);
        }

        public void ShowSettings()
        {
            HideAllPanels();
            if (settingsPanel) settingsPanel.SetActive(true);
        }

        private void HideAllPanels()
        {
            if (menuPanel) menuPanel.SetActive(false);
            if (hudPanel) hudPanel.SetActive(false);
            if (pausePanel) pausePanel.SetActive(false);
            if (gameOverPanel) gameOverPanel.SetActive(false);
            if (shopPanel) shopPanel.SetActive(false);
            if (charactersPanel) charactersPanel.SetActive(false);
            if (settingsPanel) settingsPanel.SetActive(false);
        }

        // Button Event Callbacks
        public void OnClickPlay() => GameManager.Instance.StartGame();
        public void OnClickPause() => GameManager.Instance.PauseGame();
        public void OnClickResume() => GameManager.Instance.ResumeGame();
        public void OnClickRestart() => GameManager.Instance.StartGame();
        public void OnClickMainMenu() => GameManager.Instance.ReturnToMenu();
        public void OnClickOpenShop() => ShowShop();
        public void OnClickOpenCharacters() => ShowCharacters();
        public void OnClickOpenSettings() => ShowSettings();
        public void OnClickBackToMenu() => ShowMenu();
    }
}
