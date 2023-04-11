import { useState, useContext, useEffect, forwardRef } from "react";
import { DimensionsContext } from "../pages/_app.js";

function BlockDiagram({ className, blockPositions, blocksData }, ref) {
	const arrowMargin = 8; //Margen universal para las flechas
	const markerHeight = 8; //markerHeight
	const markerWidth = 6; //markerWidth
	const verticalOffset = 80; //Margin-top of BlockTable.
	const horizontalOffset = 25; //Margin-left of BlockTable.

	const [innerSVG, setInnerSVG] = useState();
	const { dimensions, setDimensions } = useContext(DimensionsContext);

	useEffect(() => {
		setInnerSVG(CreateDiagram(blockPositions));
	}, [dimensions, blockPositions, blocksData]);

	/**
	 * Creates an SVG arrow from a start position to an end position with style options.
	 * @param {Object} startPosition - The start position of the arrow.
	 * @param {Object} endPosition - The end position of the arrow.
	 * @param {Object} arrowOptions - The style options for the arrow.
	 */
	function MakeArrow(
		startPosition = { x: 100, y: 100 },
		endPosition = { x: 100, y: 100 },
		arrowOptions = { id: "no-id", strokeWidth: 3, stroke: "black" }
	) {
		if (dimensions !== undefined) {
			const sceneSettings = JSON.parse(dimensions);
			return (
				<line
					key={arrowOptions.id}
					x1={startPosition.x - sceneSettings.blockCanvasOffsetX}
					y1={startPosition.y - sceneSettings.blockCanvasOffsetY}
					x2={endPosition.x - sceneSettings.blockCanvasOffsetX}
					y2={endPosition.y - sceneSettings.blockCanvasOffsetY}
					id={arrowOptions.id}
					markerEnd="url(#head)"
					strokeWidth={arrowOptions.strokeWidth}
					stroke={arrowOptions.stroke}
				></line>
			);
		}
	}

	/**
	 * Creates an SVG arrow between two blocks with style options and direction.
	 * @param {string} from - The ID of the start block.
	 * @param {string} to - The ID of the end block.
	 * @param {Object} arrowOptions - The style options for the arrow.
	 * @param {string} direction - The direction of the arrow ("right", "left", "top", or "bottom").
	 * @param {boolean} invert - Whether to invert the start and end blocks.
	 */
	function ArrowBetweenBlocks(
		from,
		to,
		arrowOptions,
		direction = "right",
		invert = false
	) {
		const lineID = "LF" + from + "T" + to; //Line From x To y
		let a = blockPositions.find((e) => e.bpos.id == from);
		let b = blockPositions.find((e) => e.bpos.id == to);
		if (a && b) {
			let bfrom = a.bpos;
			let bto = b.bpos;
			let genArrowOptions = { id: lineID, strokeWidth: 3, stroke: "#ccc" };
			if (arrowOptions == undefined) arrowOptions = genArrowOptions;
			let fromOffsetX, fromOffsetY, toOffsetX, toOffsetY;

			if (invert) {
				let temp = bfrom;
				bfrom = bto;
				bto = temp;
			}

			switch (direction) {
				case "right":
					fromOffsetX = bfrom.width + arrowMargin;
					fromOffsetY = bfrom.height / 2;

					if (aproxEqual(bfrom.y, bto.y, 50)) {
						// Si están al mismo nivel
						toOffsetY = bto.height / 2;
						toOffsetX = -arrowMargin - markerHeight;
					} else {
						if (bfrom.y > bto.y) {
							// Si el objetivo está por encima
							toOffsetY = bto.height + markerHeight;
							toOffsetX = -markerWidth / 2;
						} else {
							// Si el objetivo está por debajo
							toOffsetY = -markerHeight;
							toOffsetX = -markerWidth / 2;
						}
					}

					break;
				case "left":
					fromOffsetX = -arrowMargin;
					fromOffsetY = bfrom.height / 2;
					toOffsetX = bto.width + arrowMargin + markerHeight;
					toOffsetY = bto.height / 2;
					break;
				case "top":
					break;
				case "bottom":
					break;
				default:
					fromOffsetX = fromOffsetY = toOffsetX = toOffsetY = 0;
					break;
			}
			fromOffsetY += verticalOffset;
			toOffsetY += verticalOffset;
			fromOffsetX += horizontalOffset;
			toOffsetX += horizontalOffset;

			return MakeArrow(
				{ x: bfrom.x + fromOffsetX, y: bfrom.y + fromOffsetY },
				{ x: bto.x + toOffsetX, y: bto.y + toOffsetY },
				arrowOptions
			);
		}
	}

	/**
	 * Creates an SVG diagram from an array of block positions.
	 * @param {Array} blockPositions - An array of block positions.
	 */
	function CreateDiagram(blockPositions = []) {
		let diagram = [];
		for (const [i, blockPosition] of blockPositions.entries()) {
			const bpos = blockPosition.bpos;

			// Si es un bloque de inicio o fin
			if (bpos.id < 0) {
				//Si es un bloque de fin
				if (bpos.id == -1) {
				} else {
					//Comprobación de tamaño del mapa
					if (blocksData.length > 2) {
						//Si el bloque es de inicio
						if (blockPositions.find((e) => e.bpos.id == 0))
							diagram.push(ArrowBetweenBlocks(-2, 0));
						else diagram.push(ArrowBetweenBlocks(-1, 0));
					} else {
						diagram.push(ArrowBetweenBlocks(-2, -1));
					}
				}
			} else {
				if (bpos.children) {
					bpos.children.forEach((child) => {
						diagram.push(ArrowBetweenBlocks(bpos.id, child));
					});
				}
			}
		}
		return diagram;
	}

	/**
	 * Checks if two numbers are approximately equal within a given difference.
	 * @param {number} num1 - The first number.
	 * @param {number} num2 - The second number.
	 * @param {number} difference - The maximum allowed difference between the two numbers.
	 */
	function aproxEqual(num1, num2, difference) {
		return Math.abs(num1 - num2) < difference;
	}

	return (
		<>
			<svg ref={ref} className={className}>
				<defs>
					<marker
						id="head"
						orient="auto"
						markerWidth="6"
						markerHeight="8"
						refX="0.1"
						refY="2"
					>
						<path d="M0,0 V4 L2,2 Z" fill="#ccc" />
					</marker>
				</defs>
				{innerSVG}
			</svg>
		</>
	);
}
const BlockDiagramWithRef = forwardRef(BlockDiagram);
export default BlockDiagramWithRef;
