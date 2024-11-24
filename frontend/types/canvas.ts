export type Color = {
    r: number;
    g: number;
    b: number;
};

export type Camera = {
    x: number;
    y: number;
};

export const enum LayerType {
    Rectangle,
    Ellipse,
    Path,
    Text,
    Note,
}

export type RectangleLayer = {
    id: string;
    type: LayerType.Rectangle;
    x: number;
    y: number;
    height: number;
    width: number;
    fill: Color;
    value?: string;
};

export type EllipseLayer = {
    id: string;
    type: LayerType.Ellipse;
    x: number;
    y: number;
    height: number;
    width: number;
    fill: Color;
    value?: string;
};

export type NoteLayer = {
    id: string;
    type: LayerType.Note;
    x: number;
    y: number;
    height: number;
    width: number;
    fill: Color;
    value?: string;
};

export type PathLayer = {
    id: string;
    type: LayerType.Path;
    x: number;
    y: number;
    height: number;
    width: number;
    fill: Color;
    points: number[][];
    value?: string;
};

export type Point = {
    x: number;
    y: number;
};

export type XYWH = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export const enum Side {
    Top = 1,
    Bottom = 2,
    Left = 4,
    Right = 8,
}

export type CanvasState =
    | {
          mode: CanvasMode.None;
      }
    | {
          mode: CanvasMode.SelectionNet;
          origin: Point;
          current?: Point;
      }
    | {
          mode: CanvasMode.Translating;
          current: Point;
      }
    | {
          mode: CanvasMode.Inserting;
          layerType:
              | LayerType.Ellipse
              | LayerType.Rectangle
              | LayerType.Text
              | LayerType.Note;
      }
    | {
          mode: CanvasMode.Pencil;
      }
    | {
          mode: CanvasMode.Pressing;
          origin: Point;
      }
    | {
          mode: CanvasMode.Resizing;
          initialBounds: XYWH;
          corner: Side;
      };

export const enum CanvasMode {
    None,
    Pressing,
    SelectionNet,
    Translating,
    Inserting,
    Resizing,
    Pencil,
}

export type Layer = RectangleLayer | EllipseLayer | PathLayer;
