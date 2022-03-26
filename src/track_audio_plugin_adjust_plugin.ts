import type {
  InputWidgetConfig,
  LabelText,
  ParamDescriptor,
  Song,
  TrackSelectorWidgetConfig,
} from 'tuneflow';
import { TuneflowPlugin, WidgetType, decodeAudioPluginTuneflowId } from 'tuneflow';

export class TrackAudioPluginAdjust extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'track-audio-plugin-adjust';
  }

  static providerDisplayName(): LabelText {
    return {
      zh: 'Andantei行板',
      en: 'Andantei',
    };
  }

  static pluginDisplayName(): LabelText {
    return {
      zh: '调整音源/音效插件',
      en: 'Audio Plugin Adjustment',
    };
  }

  static pluginDescription(): LabelText | null {
    return {
      zh: '调整选中轨道的音源/音效插件',
      en: 'Adjust the audio tracks of the track',
    };
  }

  static allowReset(): boolean {
    return false;
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
        adjustable: false,
        hidden: true,
      },
      samplerPlugin: {
        displayName: {
          zh: '音源插件',
          en: 'Sampler Plugin',
        },
        defaultValue: null,
        widget: {
          type: WidgetType.Input,
          config: {} as InputWidgetConfig,
        },
        hidden: true,
      },
    };
  }

  async run(song: Song, params: { [paramName: string]: any }): Promise<void> {
    const trackId = this.getParam<string>(params, 'trackId');
    const samplerPlugin = this.getParam<any>(params, 'samplerPlugin');
    const track = song.getTrackById(trackId);
    if (!track) {
      throw new Error('Track not ready');
    }
    if (samplerPlugin && samplerPlugin.tfId) {
      const audioPlugin = decodeAudioPluginTuneflowId(samplerPlugin.tfId);
      audioPlugin.setIsEnabled(samplerPlugin.isEnabled);
      track.setSamplerPlugin(audioPlugin);
    }
  }
}
