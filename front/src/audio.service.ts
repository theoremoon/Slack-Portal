import { Injectable } from '@angular/core';

@Injectable()
export class AudioService {
    private audioContext = new AudioContext();
    private audioBuffer: Promise<AudioBuffer>;

    load(url: string): void {
        this.audioBuffer = fetch('assets/gomen.mp3')
            .then(response => response.arrayBuffer())
            .then((buffer): Promise<AudioBuffer> => {
                return new Promise((resolve, reject) => {
                    this.audioContext.decodeAudioData(buffer, resolve, reject);
                });
            })
            .catch(err => {throw err});
    }
    play(): void {
        this.audioBuffer.then((audioBuffer)=>{
            let bufferSource = this.audioContext.createBufferSource();
            bufferSource.buffer = audioBuffer;
            bufferSource.connect(this.audioContext.destination);
            bufferSource.start(0);
        });
    }
}