import FocusTrap from "focus-trap-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquarePlus, faPaste } from "@fortawesome/free-solid-svg-icons";
import styles from "@components/styles/BlockContextualMenu.module.css";
import { Button } from "react-bootstrap";
import { notImplemented } from "@components/pages/_app";
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
