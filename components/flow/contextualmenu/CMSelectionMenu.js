import FocusTrap from "focus-trap-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faObjectGroup,
	faScissors,
	faClipboard,
	faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import styles from "@root/styles/ContextualMenu.module.css";
import { Button } from "react-bootstrap";
import { useRef, forwardRef } from "react";

const Menu = (
	{
		handleFragmentCreation,
		handleNodeSelectionDeletion,
		handleNodeCopy,
		handleNodeCut,
		blocksData,
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
					onClick={handleFragmentCreation}
					disabled={!EnableCreateFragment}
				>
					<div>
						<FontAwesomeIcon icon={faObjectGroup} />
						<div>
							Crear fragmento
							<span>CTRL/Cmd+F</span>
						</div>
					</div>
				</Button>
			</li>
			<li>
				<Button
					variant="light"
					onClick={() => handleNodeCopy(blocksData)}
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
				<Button
					variant="light"
					onClick={() => handleNodeCut(blocksData)}
					disabled={!EnableCut}
				>
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
					onClick={() => handleNodeSelectionDeletion(blocksData)}
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
	handleFragmentCreation,
	handleNodeSelectionDeletion,
	handleNodeCopy,
	handleNodeCut,
	blocksData,
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
				handleFragmentCreation={handleFragmentCreation}
				handleNodeSelectionDeletion={handleNodeSelectionDeletion}
				handleNodeCopy={handleNodeCopy}
				handleNodeCut={handleNodeCut}
				blocksData={blocksData}
				EnableCreateFragment={EnableCreateFragment}
				EnableCut={EnableCut}
				EnableCopy={EnableCopy}
				EnableDelete={EnableDelete}
			/>
		</FocusTrap>
	) : (
		<MenuWithRefs
			ref={ref}
			handleFragmentCreation={handleFragmentCreation}
			handleNodeSelectionDeletion={handleNodeSelectionDeletion}
			handleNodeCopy={handleNodeCopy}
			handleNodeCut={handleNodeCut}
			blocksData={blocksData}
			EnableCreateFragment={EnableCreateFragment}
			EnableCut={EnableCut}
			EnableCopy={EnableCopy}
			EnableDelete={EnableDelete}
		/>
	);
}
