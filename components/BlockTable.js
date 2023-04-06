import styles from "@components/styles/BlockTable.module.css";
import BlockContainer from "./BlockContainer";
import { useState, useContext } from "react";
import { useLayoutEffect } from "react";
import { SettingsContext } from "@components/pages/_app";

const { forwardRef } = require("react");

function BlockTable({ blocksData }, ref) {
	const { settings, setSettings } = useContext(SettingsContext);
	const parsedSettings = JSON.parse(settings);
	const { compact, animations } = parsedSettings;

	const [dynamicTable, setDynamicTable] = useState(doTable(blocksData));

	useLayoutEffect(() => {
		setDynamicTable(doTable(blocksData));
	}, [blocksData]);

	function doTable(blocksData) {
		let tDimensions = getTableDimensions(blocksData);
		return <>{createAndPopulateTable(blocksData, tDimensions)}</>;
	}

	function getTableDimensions(blocksData) {
		let maxX = 0;
		let maxY = 0;

		for (let block of blocksData) {
			block.x > maxX ? (maxX = block.x) : null;
			block.y > maxY ? (maxY = block.y) : null;
		}
		let dimensions = { x: maxX + 1, y: maxY };
		return dimensions; //+1 for the end block
	}

	function createAndPopulateTable(blocksData, tDimensions) {
		//Update start and end positions
		let centerPos = blocksData.find((e) => e.id == 0).y;
		let startBlock = blocksData.find((e) => e.id == -2);
		let endBlock = blocksData.find((e) => e.id == -1);

		let newBlocksData = [...blocksData];
		startBlock.y = centerPos;
		endBlock.y = centerPos;
		endBlock.x = tDimensions.x;
		newBlocksData[0] = startBlock;
		newBlocksData[1] = endBlock;
		//Create and populate the table
		let yElements = [];
		for (let y = 0; y < tDimensions.y + 1; y++) {
			let xElements = [];
			for (let x = 0; x < tDimensions.x + 1; x++) {
				let currentBlock = newBlocksData.find((e) => e.x == x && e.y == y);
				if (currentBlock != undefined) {
					if (currentBlock.type != "start" && currentBlock.type != "end") {
						//TODO: Añadir todos los tipos
						let details = getDetails(currentBlock, newBlocksData);
						//FIXME EVITAR ACCIONES
						xElements.push(
							<td key={x} style={{ height: 0 }}>
								<BlockContainer
									blockData={currentBlock}
									unit={"" + details.unit}
									order={"" + details.order}
								/>
							</td>
						);
					} else {
						xElements.push(
							<td key={x}>
								<BlockContainer blockData={currentBlock} />
							</td>
						);
					}
				} else {
					xElements.push(<td key={x}></td>);
				}
			}
			yElements.push(<tr key={y}>{xElements}</tr>);
		}
		return yElements;
	}

	function getDetails(selectedBlock, blocksData) {
		let headings = 0;
		let order = 0;

		let blocksOrdered = getBlocksOrdered(blocksData);
		order = blocksOrdered.findIndex((e, i) => e.id == selectedBlock.id) + 1;

		for (let block of blocksOrdered) {
			if (block.identation == 1) {
				headings++;
			}
			if (block.id == selectedBlock.id) {
				break;
			}
		}

		return { unit: headings, order: order };
	}

	function getBlocksOrdered(blocksData) {
		let orderedBlocks = [];
		let firstBlock = blocksData.find((e) => e.id == 0); //FIXME Esto no permite que se haga bifurcación al inicio
		return findNext(blocksData, firstBlock, []);
	}

	function findNext(blocksData, currentBlock, orderedBlocks = []) {
		//FIXME NO FUNCIONA se pone a 0
		if (currentBlock.type != "badge") {
			//TODO Incluir todos los tipos que no desenvocan en nada
			if (blocksData && currentBlock) {
				orderedBlocks.push(currentBlock);
				if (currentBlock.children) {
					for (let childrenBlockId of currentBlock.children) {
						if (childrenBlockId > 0) {
							let childrenBlock = blocksData.find(
								(e) => e.id === childrenBlockId
							);
							findNext(blocksData, childrenBlock, orderedBlocks);
						}
					}
				}
			}
		}
		return orderedBlocks;
	}

	return (
		<table
			ref={ref}
			className={styles.table + " " + (compact ? styles.compact : "")}
		>
			<thead></thead>
			<tbody>{dynamicTable}</tbody>
		</table>
	);
}
const BlockTableWithRefs = forwardRef(BlockTable);
export default BlockTableWithRefs;
