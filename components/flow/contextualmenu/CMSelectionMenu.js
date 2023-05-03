import FocusTrap from "focus-trap-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faDiagramProject,
	faScissors,
	faClipboard,
	faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import styles from "@components/styles/BlockContextualMenu.module.css";
import { Button } from "react-bootstrap";
import { notImplemented } from "@components/pages/_app";
import { useRef, forwardRef } from "react";

const Menu = (
	{
		handleDeleteBlockSelection,
		handleBlockCopy,
		EnableCreateFragment,
		EnableCopy,
		EnableCut,
		EnableDelete,
	},
	ref
) => {
	return (
		<div ref={ref} className={styles.cM + " "}>
			<li>
				<Button
					variant="light"
					onClick={notImplemented}
					disabled={!EnableCreateFragment}
				>
					<div>
						<FontAwesomeIcon icon={faDiagramProject} />
						<div>
							Crear fragmento
							<span>CTRL+F</span>
						</div>
					</div>
				</Button>
			</li>
			<li>
				<Button
					variant="light"
					onClick={() => handleBlockCopy()}
					disabled={!EnableCopy}
				>
					<div>
						<FontAwesomeIcon icon={faClipboard} />
						<div>
							Copiar bloques
							<span>CTRL+C</span>
						</div>
					</div>
				</Button>
			</li>
			<li>
				<Button variant="light" onClick={notImplemented} disabled={!EnableCut}>
					<div>
						<FontAwesomeIcon icon={faScissors} />
						<div>
							Cortar bloques
							<span>CTRL+X</span>
						</div>
					</div>
				</Button>
			</li>
			<li>
				<Button
					variant="light"
					onClick={handleDeleteBlockSelection}
					disabled={!EnableDelete}
				>
					<div>
						<FontAwesomeIcon icon={faTrashCan} />
						<div>
							Eliminar bloques
							<span>Supr / Backspace</span>
						</div>
					</div>
				</Button>
			</li>
		</div>
	);
};
const MenuWithRefs = forwardRef(Menu);

export default function CMSelectionMenu({
	handleDeleteBlockSelection,
	handleBlockCopy,
	EnableCreateFragment = false,
	EnableCopy = false,
	EnableCut = false,
	EnableDelete = false,
}) {
	const ref = useRef(null);
	const focus = EnableCopy || EnableCut || EnableDelete || EnableCreateFragment;
	return focus ? (
		<FocusTrap
			focusTrapOptions={{
				clickOutsideDeactivates: true,
				returnFocusOnDeactivate: true,
			}}
			active={true}
		>
			<MenuWithRefs
				ref={ref}
				handleDeleteBlockSelection={handleDeleteBlockSelection}
				handleBlockCopy={handleBlockCopy}
				EnableCreateFragment={EnableCreateFragment}
				EnableCut={EnableCut}
				EnableCopy={EnableCopy}
				EnableDelete={EnableDelete}
			/>
		</FocusTrap>
	) : (
		<MenuWithRefs
			ref={ref}
			handleDeleteBlockSelection={handleDeleteBlockSelection}
			handleBlockCopy={handleBlockCopy}
			EnableCreateFragment={EnableCreateFragment}
			EnableCut={EnableCut}
			EnableCopy={EnableCopy}
			EnableDelete={EnableDelete}
		/>
	);
}
