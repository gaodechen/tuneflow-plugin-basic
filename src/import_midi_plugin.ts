import { SongAccess, TempoEvent, TimeSignatureEvent, TuneflowPlugin, WidgetType } from 'tuneflow';
import type { FileSelectorWidgetConfig, LabelText, ParamDescriptor, Song } from 'tuneflow';
import { Midi } from '@tonejs/midi';

export class ImportMIDI extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'import-midi';
  }

  static providerDisplayName(): LabelText {
    return {
      zh: 'Andantei行板',
      en: 'Andantei',
    };
  }

  static pluginDisplayName(): LabelText {
    return {
      zh: '导入MIDI',
      en: 'Import MIDI',
    };
  }

  static pluginDescription(): LabelText | null {
    return {
      zh: '导入本地MIDI文件',
      en: 'Import a local MIDI file',
    };
  }

  static allowReset(): boolean {
    return false;
  }

  params(): { [paramName: string]: ParamDescriptor } {
    return {
      file: {
        displayName: {
          zh: '文件',
          en: 'File',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.FileSelector,
          config: {
            allowedExtensions: ['mid', 'MID', 'midi', 'MIDI'],
          } as FileSelectorWidgetConfig,
        },
      },
      overwriteTemposAndTimeSignatures: {
        displayName: {
          zh: '覆盖现有Tempo和Time Signature',
          en: 'Overwrite existing tempos and time signatures.',
        },
        defaultValue: false,
        widget: {
          type: WidgetType.Switch,
        },
      },
    };
  }

  public allowManualApplyAdjust(): boolean {
    return true;
  }
  songAccess(): SongAccess {
    return {
      createTrack: true,
    };
  }

  async run(song: Song, params: { [paramName: string]: any }): Promise<void> {
    const file = this.getParam<File>(params, 'file');
    const fileBuffer = await file.arrayBuffer();
    const overwriteTemposAndTimeSignatures = this.getParam<boolean>(
      params,
      'overwriteTemposAndTimeSignatures',
    );
    const midi = new Midi(fileBuffer);

    // Optionally overwrite tempos and time signatures.
    if (overwriteTemposAndTimeSignatures) {
      const newTempoEvents = [];
      for (const rawTempoEvent of midi.header.tempos) {
        newTempoEvents.push(
          new TempoEvent({
            ticks: rawTempoEvent.ticks,
            time: rawTempoEvent.time as number,
            bpm: rawTempoEvent.bpm,
          }),
        );
      }
      song.overwriteTempoChanges(newTempoEvents);
      const newTimeSignatureEvents = [];
      for (const rawTimeSignatureEvent of midi.header.timeSignatures) {
        newTimeSignatureEvents.push(
          new TimeSignatureEvent({
            ticks: rawTimeSignatureEvent.ticks,
            // TODO: Verify if this order is correct.
            numerator: rawTimeSignatureEvent.timeSignature[0],
            denominator: rawTimeSignatureEvent.timeSignature[1],
          }),
        );
      }
      song.overwriteTimeSignatures(newTimeSignatureEvents);
    }

    // Add tracks and notes.
    for (const track of midi.tracks) {
      const songTrack = song.createTrack({});
      songTrack.setInstrument({
        program: track.instrument.number,
        isDrum: track.instrument.percussion,
      });
      const trackClip = songTrack.createClip({ clipStartTick: 0 });
      for (const note of track.notes) {
        trackClip.createNote({
          pitch: note.midi,
          velocity: Math.round(note.velocity * 127),
          startTick: note.ticks,
          endTick: note.ticks + note.durationTicks,
        });
      }
    }
  }
}