import Image from "next/image";

export default function Sponsor() {
	return (
		<div className="flex flex-col">
			<div className="flex flex-row justify-content-center">
				<Image
					src={"/images/ue/foundedbyeu.png"}
					alt="Financiado por la Unión Europea - NextGenerationEU"
					width={300}
					height={70}
				></Image>
				<Image
					src={"/images/ue/prtr.png"}
					alt="Plan de Recuperación Transformación y Resilencia"
					width={300}
					height={150}
				></Image>
			</div>
			<p>Financiado por la Unión Europea - NextGenerationEU</p>
		</div>
	);
}
