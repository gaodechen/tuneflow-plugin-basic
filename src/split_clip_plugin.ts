import { InjectSource, ClipType, Clip, TuneflowPlugin, WidgetType } from 'tuneflow';
import type { AudioClipData, ParamDescriptor, Song } from 'tuneflow';

export class SplitClip extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'split-clip';
  }

  params(): { [paramName: string]: ParamDescriptor } {
    return {
      clipInfos: {
        displayName: {
          zh: '待分割片段',
          en: 'Clips to split',
        },
        defaultValue: [],
        widget: {
          type: WidgetType.None,
        },
        hidden: true,
        injectFrom: InjectSource.SelectedClipInfos,
      },
      playheadTick: {
        displayName: {
          zh: '当前指针位置',
          en: 'Playhead Position',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.InputNumber,
        },
        hidden: true,
        injectFrom: InjectSource.TickAtPlayhead,
      },
    };
  }

  async run(song: Song, params: { [paramName: string]: any }): Promise<void> {
    const clipInfos = this.getParam<any[]>(params, 'clipInfos');
    const playheadTick = this.getParam<number>(params, 'playheadTick');
    for (const clipInfo of clipInfos) {
      const { trackId, clipId } = clipInfo;
      const track = song.getTrackById(trackId);
      if (!track) {
        throw new Error('Track not found.');
      }
      const clip = track.getClipById(clipId);
      if (!clip) {
        throw new Error('Clip not found.');
      }
      if (playheadTick <= clip.getClipStartTick() || playheadTick >= clip.getClipEndTick()) {
        console.log('Skipping clip', clip.getId());
        continue;
      }
      const newClipStartTick = clip.getClipStartTick();
      const newClipEndTick = playheadTick - 1;
      const leftNotes = clip
        .getNotes()
        .filter(item =>
          Clip.isNoteInClip(
            item.getStartTick(),
            item.getEndTick(),
            newClipStartTick,
            newClipEndTick,
          ),
        );
      let leftClip: Clip;
      if (clip.getType() === ClipType.AUDIO_CLIP) {
        leftClip = track.createAudioClip({
          clipStartTick: newClipStartTick,
          clipEndTick: newClipEndTick,
          audioClipData: clip.getAudioClipData() as AudioClipData,
        });
      } else if (clip.getType() === ClipType.MIDI_CLIP) {
        leftClip = track.createMIDIClip({
          clipStartTick: newClipStartTick,
          clipEndTick: newClipEndTick,
        });
      } else {
        throw new Error(`Unsupported clip type ${clip.getType()}`);
      }
      for (const leftNote of leftNotes) {
        leftClip.createNote({
          pitch: leftNote.getPitch(),
          velocity: leftNote.getVelocity(),
          startTick: leftNote.getStartTick(),
          endTick: leftNote.getEndTick(),
          updateClipRange: false,
          resolveClipConflict: false,
        });
      }
    }
  }
}
