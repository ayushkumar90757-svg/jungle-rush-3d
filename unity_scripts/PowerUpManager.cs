using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace JungleRush3D
{
    public enum PowerUpType { Magnet, Shield, Boost, Multiplier }

    /// <summary>
    /// Manages active power-ups, duration timers, and multipliers.
    /// </summary>
    public class PowerUpManager : MonoBehaviour
    {
        public static PowerUpManager Instance { get; private set; }

        [Header("Base Durations (Seconds)")]
        public float baseMagnetDuration = 10.0f;
        public float baseShieldDuration = 12.0f;
        public float baseBoostDuration = 6.0f;
        public float baseMultiplierDuration = 15.0f;
        public float MagnetRadius = 12.0f;

        public bool IsMagnetActive => magnetTimer > 0;
        public bool IsShieldActive => shieldTimer > 0;
        public bool IsBoostActive => boostTimer > 0;
        public bool IsMultiplierActive => multiplierTimer > 0;

        private float magnetTimer = 0f;
        private float shieldTimer = 0f;
        private float boostTimer = 0f;
        private float multiplierTimer = 0f;

        private void Awake()
        {
            if (Instance == null) Instance = this;
            else Destroy(gameObject);
        }

        public void ResetPowerUps()
        {
            magnetTimer = 0f;
            shieldTimer = 0f;
            boostTimer = 0f;
            multiplierTimer = 0f;
            PlayerController.Instance.SetShieldVisual(false);
        }

        private void Update()
        {
            if (GameManager.Instance.CurrentState != GameState.Playing) return;

            float dt = Time.deltaTime;
            if (magnetTimer > 0) magnetTimer -= dt;
            if (shieldTimer > 0)
            {
                shieldTimer -= dt;
                if (shieldTimer <= 0) PlayerController.Instance.SetShieldVisual(false);
            }
            if (boostTimer > 0) boostTimer -= dt;
            if (multiplierTimer > 0) multiplierTimer -= dt;
        }

        public void ActivatePowerUp(PowerUpType type)
        {
            AudioManager.Instance.PlaySFX("powerup");

            switch (type)
            {
                case PowerUpType.Magnet:
                    magnetTimer = baseMagnetDuration;
                    break;
                case PowerUpType.Shield:
                    shieldTimer = baseShieldDuration;
                    PlayerController.Instance.SetShieldVisual(true);
                    break;
                case PowerUpType.Boost:
                    boostTimer = baseBoostDuration;
                    break;
                case PowerUpType.Multiplier:
                    multiplierTimer = baseMultiplierDuration;
                    break;
            }
        }

        public void DeactivateShield()
        {
            shieldTimer = 0f;
            PlayerController.Instance.SetShieldVisual(false);
        }
    }
}
