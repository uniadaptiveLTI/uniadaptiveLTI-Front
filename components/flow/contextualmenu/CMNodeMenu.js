import FocusTrap from "focus-trap-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faDiagramNext,
	faScissors,
	faClipboard,
	faTrashCan,
	faEdit,
	faCheckSquare,
} from "@fortawesome/free-solid-svg-icons";
import styles from "/styles/ContextualMenu.module.css";
import { Button } from "react-bootstrap";
import { ActionNodes } from "@utils/Nodes";
import { useRef, forwardRef, useContext } from "react";
import { getGradableTypes } from "@utils/TypeDefinitions";
import { MetaDataContext } from "/pages/_app";
import { Platforms } from "@utils/Platform";

const Menu = (
	{
		handleShow,
		relationStarter,
		blockData,
		setRelationStarter,
		setShowContextualMenu,
		handleNodeDeletion,
		handleNewRelation,
		handleNodeCopy,
		handleNodeCut,
		EnableEditPreconditions,
		EnableGradeConditions,
		EnableCreateRelation,
		EnableCut,
		EnableCopy,
		EnableDelete,
	},
	ref
) => {
	const { metaData } = useContext(MetaDataContext);
	const GRADABLE_TYPES = getGradableTypes(metaData.platform);

	return (
		<div ref={ref} className={styles.cM + " "}>
			{["fragment"].includes(blockData.type) == false && (
				<li>
					{metaData.platform == Platforms.Moodle && (
						<Button
							variant="light"
							onClick={() => handleShow(blockData.id, "conditions")}
							disabled={!EnableEditPreconditions}
						>
							<div>
								<FontAwesomeIcon icon={faEdit} />
								<div>
									Editar precondiciones
									<span>CTRL/Cmd+E</span>
								</div>
							</div>
						</Button>
					)}
					{metaData.platform == Platforms.Sakai && (
						<Button
							variant="light"
							onClick={() => handleShow(blockData.id, "requisites")}
							disabled={!EnableEditPreconditions}
						>
							<div>
								<FontAwesomeIcon icon={faEdit} />
								<div>
									Editar prerequisitos
									<span>CTRL/Cmd+E</span>
								</div>
							</div>
						</Button>
					)}
				</li>
			)}
			{["fragment"].includes(blockData.type) == false &&
				GRADABLE_TYPES.includes(blockData.type) && (
					<li>
						<Button
							variant="light"
							onClick={() => handleShow(blockData.id, "grades")}
							disabled={!EnableGradeConditions}
						>
							<div>
								<FontAwesomeIcon icon={faCheckSquare} />
								<div>
									Editar ajustes de finalización
									<span>CTRL/Cmd+ALT/Opt+E</span>
								</div>
							</div>
						</Button>
					</li>
				)}
			{relationStarter ? (
				relationStarter.id == blockData.id ? (
					<li>
						<Button
							variant="light"
							onClick={() => {
								setRelationStarter();
								setShowContextualMenu(false);
							}}
							disabled={!EnableCreateRelation}
						>
							<div>
								<FontAwesomeIcon icon={faDiagramNext} />
								<div>
									Cancelar relación
									<span>CTRL/Cmd+R</span>
								</div>
							</div>
						</Button>
					</li>
				) : (
					["fragment"].includes(blockData.type) == false && (
						<li>
							<Button
								variant="light"
								onClick={() => handleNewRelation(relationStarter, blockData)}
								disabled={!EnableCreateRelation}
							>
								<div>
									<FontAwesomeIcon icon={faDiagramNext} />
									<div>
										Terminar relación
										<span>Unir a "{relationStarter.data.label}"</span>
									</div>
								</div>
							</Button>
						</li>
					)
				)
			) : (
				[...ActionNodes, "end", "fragment"].includes(blockData.type) ==
					false && (
					<li>
						<Button
							variant="light"
							onClick={() => {
								setRelationStarter(blockData);
								setShowContextualMenu(false);
							}}
							disabled={!EnableCreateRelation}
						>
							<div>
								<FontAwesomeIcon icon={faDiagramNext} />
								<div>
									Crear relación
									<span>CTRL/Cmd+R</span>
								</div>
							</div>
						</Button>
					</li>
				)
			)}
			<li>
				<Button
					variant="light"
					onClick={() => handleNodeCopy([blockData])}
					disabled={!EnableCopy}
				>
					<div>
						<FontAwesomeIcon icon={faClipboard} />
						<div>
							Copiar bloque
							<span>CTRL+C</span>
						</div>
					</div>
				</Button>
			</li>
			<li>
				<Button
					variant="light"
					onClick={() => handleNodeCut([blockData])}
					disabled={!EnableCut}
				>
					<div>
						<FontAwesomeIcon icon={faScissors} />
						<div>
							Cortar bloque
							<span>CTRL+X</span>
						</div>
					</div>
				</Button>
			</li>
			<li>
				<Button
					variant="light"
					onClick={() => handleNodeDeletion(blockData)}
					disabled={!EnableDelete}
				>
					<div>
						<FontAwesomeIcon icon={faTrashCan} />
						<div>
							Eliminar bloque
							<span>Supr / Backspace</span>
						</div>
					</div>
				</Button>
			</li>
		</div>
	);
};
const MenuWithRefs = forwardRef(Menu);

export default function CMBlockMenu({
	handleShow,
	relationStarter,
	blockData,
	setRelationStarter,
	setShowContextualMenu,
	handleNodeDeletion,
	handleNewRelation,
	handleNodeCopy,
	handleNodeCut,
	EnableEditPreconditions = false,
	EnableGradeConditions = false,
	EnableCreateRelation = false,
	EnableCut = false,
	EnableCopy = false,
	EnableDelete = false,
}) {
	const ref = useRef(null);
	const FOCUS = !(blockData.type == "end" && relationStarter == undefined);

	return FOCUS ? (
		<FocusTrap
			focusTrapOptions={{
				clickOutsideDeactivates: true,
				returnFocusOnDeactivate: true,
			}}
			active={true}
		>
			<MenuWithRefs
				ref={ref}
				handleShow={handleShow}
				relationStarter={relationStarter}
				blockData={blockData}
				setRelationStarter={setRelationStarter}
				setShowContextualMenu={setShowContextualMenu}
				handleNodeDeletion={handleNodeDeletion}
				handleNewRelation={handleNewRelation}
				handleNodeCopy={handleNodeCopy}
				handleNodeCut={handleNodeCut}
				EnableEditPreconditions={EnableEditPreconditions}
				EnableGradeConditions={EnableGradeConditions}
				EnableCreateRelation={EnableCreateRelation}
				EnableCut={EnableCut}
				EnableCopy={EnableCopy}
				EnableDelete={EnableDelete}
			/>
		</FocusTrap>
	) : (
		<MenuWithRefs
			ref={ref}
			handleShow={handleShow}
			relationStarter={relationStarter}
			blockData={blockData}
			setRelationStarter={setRelationStarter}
			setShowContextualMenu={setShowContextualMenu}
			handleNodeDeletion={handleNodeDeletion}
			handleNewRelation={handleNewRelation}
			handleNodeCopy={handleNodeCopy}
			handleNodeCut={handleNodeCut}
			EnableEditPreconditions={EnableEditPreconditions}
			EnableCreateRelation={EnableCreateRelation}
			EnableCut={EnableCut}
			EnableCopy={EnableCopy}
			EnableDelete={EnableDelete}
		/>
	);
}
