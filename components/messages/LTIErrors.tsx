import { parseBool } from "@utils/Utils";
import { ReactNode } from "react";

interface IErrorMessage {
	msg: string;
	debug?: string;
}

interface Props {
	error: string;
	traceback?: Error;
}

const ERROR_NOT_DEFINED_ERROR: IErrorMessage = {
	msg: "Ha ocurrido un error.",
	debug: "Es posible que el error definido no sea válido.",
};

const ERROR_UNDEFINED_ERROR: IErrorMessage = {
	msg: "Ha ocurrido un error.",
	debug: "Error no definido.",
};

const ERROR_INVALID_TOKEN: IErrorMessage = {
	msg: "No se puede obtener una sesión válida para el curso con los identificadores actuales. ¿Ha expirado la sesión? Vuelva a lanzar la herramienta desde el gestor de contenido.",
	debug:
		"Compruebe si ha añadido correctamente el token al archivo multiple.lms.config en el back end, suponiendo que el usuario pueda conectarse a él.",
};

const ERRORS = {
	ERROR_UNDEFINED_ERROR: ERROR_UNDEFINED_ERROR,
	ERROR_INVALID_TOKEN: ERROR_INVALID_TOKEN,
};

export default function LTIErrorMessage({
	error,
	traceback,
}: Props): ReactNode {
	const shouldPrintDebugInfo = parseBool(process.env.NEXT_PUBLIC_DEV_MODE);
	let errorObject = ERRORS[error.toUpperCase()];
	if (!errorObject) errorObject = ERROR_NOT_DEFINED_ERROR;

	let msg = <p>{errorObject.msg}</p>;
	if (shouldPrintDebugInfo) {
		if (errorObject.debug)
			msg = (
				<>
					{msg}
					<hr />
					<p>DEBUG:</p>
					<p>{errorObject.debug}</p>
				</>
			);
		if (traceback)
			msg = (
				<>
					{msg}
					<hr />
					<p>ERROR:</p>
					<p>{traceback.message}</p>
				</>
			);
	}
	return msg;
}
