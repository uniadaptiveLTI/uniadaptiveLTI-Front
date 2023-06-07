import FocusTrap from "focus-trap-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faSquarePlus,
	faPaste,
	faSquare,
	faPersonRunning,
	faObjectGroup,
} from "@fortawesome/free-solid-svg-icons";
import styles from "@root/styles/ContextualMenu.module.css";
import { Button } from "react-bootstrap";
import { useRef, forwardRef } from "react";

const Menu = (
	{
		handleShowNodeSelector,
		createBlock,
		handleNodePaste,
		EnableCreate,
		EnablePaste,
	},
	ref
) => {
	return (
		<div ref={ref} className={styles.cM + " "}>
			<li>
				<Button
					variant="light"
					onClick={() => handleShowNodeSelector("ElementNode")}
					disabled={!EnableCreate}
				>
					<div>
						<FontAwesomeIcon icon={faSquarePlus} />
						<div>
							Crear nuevo bloque...
							<span>CTRL/Cmd+B</span>
						</div>
					</div>
				</Button>
			</li>
			<li>
				<Button
					variant="light"
					onClick={() => handleShowNodeSelector("ActionNode")}
					disabled={!EnableCreate}
				>
					<div>
						<div className={"fa-layers " + styles.layeredIcon}>
							<FontAwesomeIcon icon={faSquare} />
							<FontAwesomeIcon
								icon={faPersonRunning}
								color="white"
								style={{ transform: "scale(0.75)" }}
							/>
						</div>
						<div>
							Crear nuevo bloque de acción...
							<span>CTRL/Cmd+ALT/Opt+B</span>
						</div>
					</div>
				</Button>
			</li>
			<li>
				<Button
					variant="light"
					onClick={() => createBlock({ type: "emptyfragment" })}
					disabled={!EnableCreate}
				>
					<div>
						<div className={"fa-layers " + styles.layeredIcon}>
							<FontAwesomeIcon icon={faObjectGroup} />
						</div>
						<div>
							Crear nuevo fragmento vacío
							<span>CTRL/Cmd+F</span>
						</div>
					</div>
				</Button>
			</li>
			<li>
				<Button
					variant="light"
					onClick={() => handleNodePaste()}
					disabled={!EnablePaste}
				>
					<div>
						<FontAwesomeIcon icon={faPaste} />

						<div>
							Pegar bloque/s
							<span>CTRL+V</span>
						</div>
					</div>
				</Button>
			</li>
		</div>
	);
};

const MenuWithRefs = forwardRef(Menu);

export default function CMPaneMenu({
	createBlock,
	handleShowNodeSelector,
	handleNodePaste,
	EnableCreate = false,
	EnablePaste = false,
}) {
	const ref = useRef(null);

	return (
		<FocusTrap
			focusTrapOptions={{
				clickOutsideDeactivates: true,
				returnFocusOnDeactivate: true,
			}}
			active={true}
		>
			<MenuWithRefs
				ref={ref}
				createBlock={createBlock}
				handleShowNodeSelector={handleShowNodeSelector}
				handleNodePaste={handleNodePaste}
				EnableCreate={EnableCreate}
				EnablePaste={EnablePaste}
			/>
		</FocusTrap>
	);
}
