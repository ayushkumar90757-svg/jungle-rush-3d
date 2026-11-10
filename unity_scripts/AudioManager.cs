using System.Collections.Generic;
using UnityEngine;

namespace JungleRush3D
{
    /// <summary>
    /// Dual AudioSource Manager for BGM and Sound FX with volume persistence.
    /// </summary>
    public class AudioManager : MonoBehaviour
    {
        public static AudioManager Instance { get; private set; }

        [Header("Audio Sources")]
        public AudioSource musicSource;
        public AudioSource sfxSource;

        [System.Serializable]
        public struct SoundEntry
        {
            public string name;
            public AudioClip clip;
        }

        public List<SoundEntry> soundList;
        private Dictionary<string, AudioClip> soundDict;

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

            soundDict = new Dictionary<string, AudioClip>();
            foreach (var item in soundList)
            {
                soundDict[item.name] = item.clip;
            }
        }

        public void PlayMusic(string name)
        {
            if (soundDict.TryGetValue(name, out AudioClip clip))
            {
                musicSource.clip = clip;
                musicSource.loop = true;
                musicSource.Play();
            }
        }

        public void StopMusic()
        {
            if (musicSource) musicSource.Stop();
        }

        public void PlaySFX(string name)
        {
            if (soundDict.TryGetValue(name, out AudioClip clip))
            {
                sfxSource.PlayOneShot(clip);
            }
        }

        public void SetMusicVolume(float val)
        {
            if (musicSource) musicSource.volume = Mathf.Clamp01(val);
        }

        public void SetSFXVolume(float val)
        {
            if (sfxSource) sfxSource.volume = Mathf.Clamp01(val);
        }
    }
}
