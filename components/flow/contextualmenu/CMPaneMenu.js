import FocusTrap from "focus-trap-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faSquarePlus,
	faPaste,
	faSquare,
	faPersonRunning,
} from "@fortawesome/free-solid-svg-icons";
import styles from "@components/styles/ContextualMenu.module.css";
import { Button } from "react-bootstrap";
import { useRef, forwardRef } from "react";

const Menu = (
	{ createBlock, handleBlockPaste, EnableCreate, EnablePaste },
	ref
) => {
	return (
		<div ref={ref} className={styles.cM + " "}>
			<li>
				<Button
					variant="light"
					onClick={() => createBlock()}
					disabled={!EnableCreate}
				>
					<div>
						<FontAwesomeIcon icon={faSquarePlus} />
						<div>
							Crear nuevo bloque...
							<span>SHIFT+B</span>
						</div>
					</div>
				</Button>
			</li>
			<li>
				<Button
					variant="light"
					onClick={() => createBlock({ type: "action" })}
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
							<span>SHIFT+ALT+B</span>
						</div>
					</div>
				</Button>
			</li>
			<li>
				<Button
					variant="light"
					onClick={() => handleBlockPaste()}
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
	handleBlockPaste,
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
				handleBlockPaste={handleBlockPaste}
				EnableCreate={EnableCreate}
				EnablePaste={EnablePaste}
			/>
		</FocusTrap>
	);
}
