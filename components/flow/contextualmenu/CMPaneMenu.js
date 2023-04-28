import FocusTrap from "focus-trap-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquarePlus, faPaste } from "@fortawesome/free-solid-svg-icons";
import styles from "@components/styles/BlockContextualMenu.module.css";
import { Button } from "react-bootstrap";
import { notImplemented } from "@components/pages/_app";
import { useRef, forwardRef } from "react";

const Menu = ({ createBlock, EnableCreate, EnablePaste }, ref) => {
	return (
		<div ref={ref} className={styles.cM + " "}>
			<li>
				<Button
					variant="light"
					onClick={() => createBlock()}
					disabled={!EnableCreate}
				>
					<div role="button">
						<FontAwesomeIcon icon={faSquarePlus} />
						Crear nuevo bloque...
					</div>
				</Button>
			</li>
			<li>
				<Button
					variant="light"
					onClick={notImplemented}
					disabled={!EnablePaste}
				>
					<div>
						<FontAwesomeIcon icon={faPaste} />
						Pegar bloque/s
					</div>
				</Button>
			</li>
		</div>
	);
};

const MenuWithRefs = forwardRef(Menu);

export default function CMPaneMenu({
	createBlock,
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
				EnableCreate={EnableCreate}
				EnablePaste={EnablePaste}
			/>
		</FocusTrap>
	);
}
