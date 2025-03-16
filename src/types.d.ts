export declare interface Element {
    id: string;
    emoji: string;
}

export declare interface Step {
    a: Element;
    b: Element;
    result: Element;
}

export declare interface LineageResponse {
    steps: Step[];
}
