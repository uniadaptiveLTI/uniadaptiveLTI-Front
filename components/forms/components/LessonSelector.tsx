import { IMetaData } from "@components/interfaces/IMetaData";
import { forwardRef, useId } from "react";
import { Form } from "react-bootstrap";

interface Props {
	lessons: IMetaData["lessons"];
	label?: string;
	changeSelectedLesson: Function;
}

export default forwardRef<HTMLSelectElement, Props>(function LessonSelector(
	{
		lessons,
		label = "Seleccione un contenido de los siguientes",
		changeSelectedLesson,
	}: Props,
	ref
) {
	const SELECT_LABEL = useId();
	return (
		<Form>
			<Form.Group className="mb-3">
				<Form.Label htmlFor={SELECT_LABEL} className="mb-1">
					{label}
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
