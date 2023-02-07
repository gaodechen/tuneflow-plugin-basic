import { TrackType, TuneflowPlugin, WidgetType, Song } from 'tuneflow';
import type {
  AuxTrackData,
  InputNumberWidgetConfig,
  TrackSelectorWidgetConfig,
  ParamDescriptor,
} from 'tuneflow';

export class UpdateInputBus extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'update-input-bus';
  }

  params(): { [paramName: string]: ParamDescriptor } {
    return {
      trackId: {
        displayName: {
          zh: '轨道',
          en: 'Track',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.TrackSelector,
          config: {} as TrackSelectorWidgetConfig,
        },
        hidden: true,
      },
      busRank: {
        displayName: {
          zh: '母线',
          en: 'Bus',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.InputNumber,
          config: {
            minValue: 1,
            maxValue: Song.NUM_BUSES,
            step: 1,
          } as InputNumberWidgetConfig,
        },
        hidden: true,
        optional: true,
      },
    };
  }

  async run(song: Song, params: { [paramName: string]: any }): Promise<void> {
    const trackId = this.getParam<string>(params, 'trackId');
    const track = song.getTrackById(trackId);
    if (!track) {
      throw new Error('Track not ready');
    }
    const busRank = this.getParam<number | undefined>(params, 'busRank');
    if (track.getType() !== TrackType.AUX_TRACK) {
      throw new Error('Cannot update input bus for non-Aux track');
    }
    if (!busRank) {
      (track.getAuxTrackData() as AuxTrackData).removeInputBus();
    } else {
      (track.getAuxTrackData() as AuxTrackData).setInputBusRank(busRank);
    }
  }
}
