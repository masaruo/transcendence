export class ElemEvent
{
	readonly id_: string;
	readonly event_: string;
	readonly callback_: (e: Event) => void;

	constructor(elem_id: string, event: string, callback: (e: Event) => void)
	{
		this.id_ = elem_id;
		this.event_ = event;
		this.callback_ = callback;
	}
}
