export type Color = {
    r: number;
    g: number;
    b: number;
}

export enum LayerType {
    Rectangle,
    Ellipse,
    Path,
    Text,
    Note
}

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
}

export type Layer = PathLayer;