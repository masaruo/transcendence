export class IdEvent {
    readonly    id_: string;
    readonly    event_: string;
    readonly    callback_: (e: Event) => void;
    private     is_attached_ = false;
    private     element_: HTMLElement | null = null;

    constructor(elem_id: string, event: string, callback: (e: Event) => void) {
        if (elem_id == null || elem_id === "") {
            throw new Error("Element ID is required and cannot be empty.");
        }
        if (event == null || event === "") {
            throw new Error("Event type is required and cannot be empty.");
        }
        if (typeof callback !== "function") {
            throw new Error("Callback must be a valid function.");
        }

        this.id_ = elem_id;
        this.event_ = event;
        this.callback_ = callback;
    }
    attach(): void
    {
        if (this.is_attached_)
            return ;

        this.element_= document.getElementById(this.id_);
        if (!this.element_)
            throw new Error("Failed to get an element by id.");

        this.element_.addEventListener(this.event_, this.callback_);
        this.is_attached_ = true;
    }
    detach(): void
    {
        if (!this.is_attached_ || !this.element_)
            return ;

        this.element_.removeEventListener(this.event_, this.callback_);
        this.is_attached_ = false;
    }
    isAttached(): boolean
    {
        return this.is_attached_;
    }
}
