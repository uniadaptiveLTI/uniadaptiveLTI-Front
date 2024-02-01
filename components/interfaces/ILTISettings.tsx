export interface ILTISettings {
	visibleAdminButton: boolean;
	branding: Branding;
}

interface BaseBrandingOptions {
	fontColor: string;
	fontFamily: string;
	backgroundColor: string;
}

interface Branding {
	faviconx16_path: string;
	faviconx32_path: string;
	faviconx180_path: string;
	logo_path: string;
	small_logo_path: string;
	main: MainBranding;
	header: HeaderBranding;
	aside: AsideBranding;
	blockflow: BlockflowBranding;
}

interface MainBranding extends BaseBrandingOptions {
	borderRadius: string;
	secondaryBackgroundColor: string;
	tertiaryBackgroundColor: string;
}

interface HeaderBranding extends BaseBrandingOptions {
	userImageBorderRadius: string;
	userImageBorderWidth: string;
	userImageBorderColor: string;
	actionButtons: ActionButtonsBranding;
	versionDropdown: VersionDropdownBranding;
}

interface AsideBranding extends BaseBrandingOptions {
	collapse: CollapseBranding;
	logo: { backgroundColor: string };
}

interface BlockflowBranding extends BaseBrandingOptions {
	label: BaseBrandingOptions;
	hover: BaseBrandingOptions;
	innerBoxShadowColor: string;
	node: NodeBranding;
	edge: EdgeBranding;
	controls: ControlsBranding;
}

interface ActionButtonsBranding {
	borderRadius: string;
	backgroundColor: string;
	svgFilter: string;
}

interface VersionDropdownBranding extends BaseBrandingOptions {
	boxShadowColor: string;
}

interface CollapseBranding {
	fontColor: string;
	backgroundColor: string;
}

interface NodeBranding {
	borderRadius: string;
	borderWidth: string;
	borderColor: string;
	handlesBorderRadius: string;
}

interface EdgeBranding {
	fontColor: string;
	backgroundColor: string;
	borderRadius: string;
	borderWidth: string;
	borderColor: string;
	handlesBorderRadius: string;
}

interface ControlsBranding {
	border: string;
	button: ControlsButtonBranding;
	minimap: ControlsMinimapBranding;
}

interface ControlsButtonBranding {
	fontColor: string;
	backgroundColor: string;
	border: string;
	svgFilter: string;
}

interface ControlsMinimapBranding {
	border: string;
	backgroundColor: string;
}
