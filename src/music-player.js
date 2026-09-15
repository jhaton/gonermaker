const controls = new Set();
const track = new Audio(`${import.meta.env.BASE_URL}audio/another-him.mp3`);
track.loop = true;
track.preload = 'auto';
track.volume = 0.32;

let status = 'off';
let armed = false;

function updateControls() {
  for (const button of controls) {
    if (!button.isConnected) {
      controls.delete(button);
      continue;
    }
    button.dataset.state = status;
    button.setAttribute('aria-pressed', String(status === 'playing'));
    const label = status === 'loading' ? 'LOADING' : status === 'playing' ? 'MUSIC ON' : 'MUSIC OFF';
    button.querySelector('b').textContent = label;
  }
}

export async function startMusic() {
  if (status === 'playing' || status === 'loading') return;
  status = 'loading';
  updateControls();
  try {
    await track.play();
    status = 'playing';
  } catch (error) {
    console.error('Unable to play background music', error);
    status = 'off';
  }
  updateControls();
}

export function stopMusic() {
  track.pause();
  status = 'off';
  updateControls();
}

export function bindMusicControl(button) {
  if (!button) return;
  controls.add(button);
  updateControls();
  button.addEventListener('click', async (event) => {
    event.stopPropagation();
    if (status === 'playing' || status === 'loading') stopMusic();
    else await startMusic();
  });
}

export function armMusicOnFirstGesture(root) {
  if (armed) return;
  armed = true;
  root.addEventListener('click', (event) => {
    if (event.target.closest('[data-action="music"]')) return;
    if (status === 'off') startMusic();
  }, { once: true });
}
