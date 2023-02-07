import { TuneflowPlugin, WidgetType } from 'tuneflow';
import type { ParamDescriptor, Song } from 'tuneflow';

export class MoveTimeSignature extends TuneflowPlugin {
  static providerId(): string {
    return 'andantei';
  }

  static pluginId(): string {
    return 'time-signature-move';
  }

  params(): { [paramName: string]: ParamDescriptor } {
    return {
      timeSignatureIndex: {
        displayName: {
          zh: '拍号序号',
          en: 'Time Signature Index',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.None,
        },
        adjustable: false,
        hidden: true,
      },
      moveToTick: {
        displayName: {
          zh: '移动至',
          en: 'Move to',
        },
        defaultValue: undefined,
        widget: {
          type: WidgetType.None,
        },
        adjustable: false,
        hidden: true,
      },
    };
  }

  async run(song: Song, params: { [paramName: string]: any }): Promise<void> {
    const timeSignatureIndex = this.getParam<number>(params, 'timeSignatureIndex');
    const moveToTick = this.getParam<number>(params, 'moveToTick');
    song.moveTimeSignature(timeSignatureIndex, moveToTick);
  }
}
