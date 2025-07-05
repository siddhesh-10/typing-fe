import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-on-screen-keyboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './on-screen-keyboard.component.html',
  styleUrls: ['./on-screen-keyboard.component.scss']
})
export class OnScreenKeyboardComponent {
  @Input() currentChar: string = '';

  pressedKey: string | null = null;
  private pressedTimeout: any;

  // QWERTY layout with key objects
  rows = [
    [
      { label: '`', type: 'normal', code: 'Backquote' },
      { label: '1', type: 'normal', code: 'Digit1' },
      { label: '2', type: 'normal', code: 'Digit2' },
      { label: '3', type: 'normal', code: 'Digit3' },
      { label: '4', type: 'normal', code: 'Digit4' },
      { label: '5', type: 'normal', code: 'Digit5' },
      { label: '6', type: 'normal', code: 'Digit6' },
      { label: '7', type: 'normal', code: 'Digit7' },
      { label: '8', type: 'normal', code: 'Digit8' },
      { label: '9', type: 'normal', code: 'Digit9' },
      { label: '0', type: 'normal', code: 'Digit0' },
      { label: '-', type: 'normal', code: 'Minus' },
      { label: '=', type: 'normal', code: 'Equal' },
      { label: 'Backspace', type: 'backspace', code: 'Backspace', width: 2 }
    ],
    [
      { label: 'Tab', type: 'tab', code: 'Tab', width: 1.5 },
      { label: 'Q', type: 'normal', code: 'KeyQ' },
      { label: 'W', type: 'normal', code: 'KeyW' },
      { label: 'E', type: 'normal', code: 'KeyE' },
      { label: 'R', type: 'normal', code: 'KeyR' },
      { label: 'T', type: 'normal', code: 'KeyT' },
      { label: 'Y', type: 'normal', code: 'KeyY' },
      { label: 'U', type: 'normal', code: 'KeyU' },
      { label: 'I', type: 'normal', code: 'KeyI' },
      { label: 'O', type: 'normal', code: 'KeyO' },
      { label: 'P', type: 'normal', code: 'KeyP' },
      { label: '[', type: 'normal', code: 'BracketLeft' },
      { label: ']', type: 'normal', code: 'BracketRight' },
      { label: '\\', type: 'normal', code: 'Backslash', width: 1.5 }
    ],
    [
      { label: 'CapsLock', type: 'caps', code: 'CapsLock', width: 1.8 },
      { label: 'A', type: 'normal', code: 'KeyA' },
      { label: 'S', type: 'normal', code: 'KeyS' },
      { label: 'D', type: 'normal', code: 'KeyD' },
      { label: 'F', type: 'normal', code: 'KeyF' },
      { label: 'G', type: 'normal', code: 'KeyG' },
      { label: 'H', type: 'normal', code: 'KeyH' },
      { label: 'J', type: 'normal', code: 'KeyJ' },
      { label: 'K', type: 'normal', code: 'KeyK' },
      { label: 'L', type: 'normal', code: 'KeyL' },
      { label: ';', type: 'normal', code: 'Semicolon' },
      { label: "'", type: 'normal', code: 'Quote' },
      { label: 'Enter', type: 'enter', code: 'Enter', width: 2.2 }
    ],
    [
      { label: 'Shift', type: 'shift', code: 'ShiftLeft', width: 2.2 },
      { label: 'Z', type: 'normal', code: 'KeyZ' },
      { label: 'X', type: 'normal', code: 'KeyX' },
      { label: 'C', type: 'normal', code: 'KeyC' },
      { label: 'V', type: 'normal', code: 'KeyV' },
      { label: 'B', type: 'normal', code: 'KeyB' },
      { label: 'N', type: 'normal', code: 'KeyN' },
      { label: 'M', type: 'normal', code: 'KeyM' },
      { label: ',', type: 'normal', code: 'Comma' },
      { label: '.', type: 'normal', code: 'Period' },
      { label: '/', type: 'normal', code: 'Slash' },
      { label: 'Shift', type: 'shift', code: 'ShiftRight', width: 2.2 }
    ],
    [
      { label: 'Space', type: 'space', code: 'Space', width: 7 }
    ]
  ];

  ngOnInit() {
    window.addEventListener('keydown', this.handleKeyDown);
  }

  ngOnDestroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
    if (this.pressedTimeout) clearTimeout(this.pressedTimeout);
  }

  handleKeyDown = (event: KeyboardEvent) => {
    let key = event.key;
    if (key === ' ') key = 'Space';
    if (key === 'CapsLock') key = 'CapsLock';
    if (key === 'Shift') key = 'Shift';
    if (key === 'Enter') key = 'Enter';
    if (key === 'Tab') key = 'Tab';
    if (key === 'Backspace') key = 'Backspace';
    // For symbols, match label
    if (key === 'ArrowLeft' || key === 'ArrowRight' || key === 'ArrowUp' || key === 'ArrowDown') return;
    this.pressedKey = key;
    if (this.pressedTimeout) clearTimeout(this.pressedTimeout);
    this.pressedTimeout = setTimeout(() => {
      this.pressedKey = null;
    }, 150);
  };

  isKeyHighlighted(key: any): boolean {
    if (!this.currentChar) return false;
    // For space
    if (key.label === 'Space' && this.currentChar === ' ') return true;
    // For enter
    if (key.label === 'Enter' && (this.currentChar === '\n' || this.currentChar === 'Enter')) return true;
    // For tab
    if (key.label === 'Tab' && this.currentChar === '\t') return true;
    // For normal keys (case-insensitive)
    if (key.label.length === 1 && key.label.toLowerCase() === this.currentChar.toLowerCase()) return true;
    return false;
  }

  isKeyPressed(key: any): boolean {
    if (!this.pressedKey) return false;
    // For space
    if (key.label === 'Space' && this.pressedKey === 'Space') return true;
    // For enter
    if (key.label === 'Enter' && this.pressedKey === 'Enter') return true;
    // For tab
    if (key.label === 'Tab' && this.pressedKey === 'Tab') return true;
    // For backspace
    if (key.label === 'Backspace' && this.pressedKey === 'Backspace') return true;
    // For capslock
    if (key.label === 'CapsLock' && this.pressedKey === 'CapsLock') return true;
    // For shift
    if (key.label === 'Shift' && this.pressedKey === 'Shift') return true;
    // For normal keys (case-insensitive)
    if (key.label.length === 1 && key.label.toLowerCase() === this.pressedKey.toLowerCase()) return true;
    return false;
  }
} 