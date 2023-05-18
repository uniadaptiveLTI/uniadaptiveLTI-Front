import FocusTrap from "focus-trap-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faObjectGroup,
	faScissors,
	faClipboard,
	faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import styles from "@components/styles/ContextualMenu.module.css";
import { Button } from "react-bootstrap";
import { useRef, forwardRef } from "react";

const Menu = (
	{
		handleFragmentCreation,
		handleDeleteBlockSelection,
		handleBlockCopy,
		handleBlockCut,
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
					onClick={() => handleBlockCopy(blocksData)}
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
					onClick={() => handleBlockCut(blocksData)}
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
					onClick={() => handleDeleteBlockSelection(blocksData)}
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
	handleDeleteBlockSelection,
	handleBlockCopy,
	handleBlockCut,
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
				handleDeleteBlockSelection={handleDeleteBlockSelection}
				handleBlockCopy={handleBlockCopy}
				handleBlockCut={handleBlockCut}
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
			handleDeleteBlockSelection={handleDeleteBlockSelection}
			handleBlockCopy={handleBlockCopy}
			handleBlockCut={handleBlockCut}
			blocksData={blocksData}
			EnableCreateFragment={EnableCreateFragment}
			EnableCut={EnableCut}
			EnableCopy={EnableCopy}
			EnableDelete={EnableDelete}
		/>
	);
}
