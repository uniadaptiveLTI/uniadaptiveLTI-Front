import { forwardRef, useId, useRef } from "react";
import { Form } from "react-bootstrap";

export default forwardRef(function LessonSelector({ lessons, label }, ref) {
	const selectLabel = useId();
	return (
		<Form>
			<Form.Group className="mb-3">
				<Form.Label htmlFor={selectLabel} className="mb-1">
					{label ? label : "Seleccione un contenido de los siguientes"}
				</Form.Label>
				<Form.Select ref={ref} id={selectLabel} className="w-100">
					{lessons &&
						lessons.map((lesson) => (
							<option key={lesson.id} value={lesson.id}>
								{lesson.name}
							</option>
						))}
				</Form.Select>
			</Form.Group>
		</Form>
	);
});
