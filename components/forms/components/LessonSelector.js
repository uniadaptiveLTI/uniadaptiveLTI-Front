import { forwardRef, useId, useLayoutEffect, useRef } from "react";
import { Form } from "react-bootstrap";

export default forwardRef(function LessonSelector(
	{ lessons, label, changeSelectedLesson },
	ref
) {
	const SELECT_LABEL = useId();
	return (
		<Form>
			<Form.Group className="mb-3">
				<Form.Label htmlFor={SELECT_LABEL} className="mb-1">
					{label ? label : "Seleccione un contenido de los siguientes"}
				</Form.Label>
				<Form.Select
					onChange={(event) =>
						changeSelectedLesson && changeSelectedLesson(event.target.value)
					}
					ref={ref}
					id={SELECT_LABEL}
					className="w-100"
				>
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
