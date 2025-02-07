import Datapack from "@/core/Datapack";
export type { PackMcmeta } from "@/core/Datapack";

export { getLabeledIdentifier, isRegistryVoxelElement, isVoxelElement, sortVoxelElements } from "@/core/Element";
export type { DataDrivenRegistryElement, ConfiguratorConfigFromDatapack, VoxelRegistryElement, VoxelElement } from "@/core/Element";

export { Identifier } from "@/core/Identifier";
export {
    createTagFromElement,
    getTagsFromRegistry,
    isPresentInTag,
    isTag,
    mergeDataDrivenRegistryElement,
    mergeTags,
    tagsToIdentifiers
} from "@/core/Tag";
export { ENGINE_VERSION, getDescription, getMinecraftVersion } from "@/core/Version";
export {
    getAnalyserForVersion,
    Analysers,
    GetAnalyserMinecraft,
    GetAnalyserVoxel,
    VersionRange,
    VersionedAnalyser,
    Analyser,
    VersionedAnalysers,
    versionedAnalyserCollection
} from "@/core/engine/Analyser";

export { Compiler, compileDatapack } from "@/core/engine/Compiler";
export { getManager } from "@/core/engine/Manager";
export { ParseDatapackResult, Parser, ParserParams, parseDatapack } from "@/core/engine/Parser";
export { ConfiguratorState, getCurrentElement, useConfiguratorStore } from "@/core/engine/Store";
export { checkCondition } from "@/core/engine/condition/index";
export {
    DatapackInfo,
    FieldLogDifferenceAdd,
    FieldLogDifferenceBase,
    FieldLogDifferenceRemove,
    FieldLogDifferenceSet,
    FileLog,
    FileLogAdded,
    FileLogBase,
    FileLogDeleted,
    FileLogUpdated,
    Log,
    LogDifference,
    LogValue
} from "@/core/engine/migrations/types";
export { checkLocks } from "@/core/engine/renderer/index";
export { resolve, resolveField } from "@/core/engine/renderer/resolve";
export {
    ConditionnalValueRenderer,
    FieldValueRenderer,
    RawValueRenderer,
    ReturnValue,
    ValueRenderer,
    getValue
} from "@/core/engine/renderer/value";
export {
    GetValueFromContext,
    InternalIterationResult,
    IterationResult,
    IterationValue,
    TemplateReplacer
} from "@/core/engine/renderer/iteration/type";
export { getConditionFields, getLockFields, getRendererFields } from "@/core/engine/utils/field";
export { useElementCondition, useElementLocks, useElementValue } from "@/core/engine/utils/hooks";
export { getPropertySafely, isStringArray } from "@/core/engine/utils/property";
export { searchRelevantElements } from "@/core/engine/utils/searchElements";
export { parseZip } from "@/core/engine/utils/zip";
export {
    BaseComponent,
    BaseInteractiveComponent,
    FormComponent,
    Lock,
    LockRenderer,
    TagViewerInclude,
    ToolCategoryType,
    ToolCounterType,
    ToolDonationType,
    ToolGridType,
    ToolInlineType,
    ToolIterationType,
    ToolListType,
    ToolPropertyType,
    ToolRangeType,
    ToolRevealElementType,
    ToolRevealType,
    ToolScrollableType,
    ToolSectionType,
    ToolSelectorType,
    ToolSlotType,
    ToolSwitchSlotType,
    ToolSwitchType,
    ToolTagViewerType
} from "@/core/schema/primitive/component";
export { FieldProperties } from "@/core/schema/primitive/properties";
export { ToggleSection, ToggleSectionMap } from "@/core/schema/primitive/toggle";
export { LabeledElement } from "@/core/schema/primitive/label";
export {
    InternalTranslateType,
    TextContent,
    TextRenderType,
    ToolListItemType,
    ToolParagraphType,
    ToolUnorderedListType,
    TranslateTextType,
    UnorderedListChildren
} from "@/core/schema/primitive/text";
export { InterfaceConfiguration, SidebarConfig, ToolConfiguration } from "@/core/schema/primitive";

export { DatapackError } from "@/core/errors/DatapackError";
export { SplitSequentialAction, updateData } from "@/core/engine/actions/index";
export { getFieldValue } from "@/core/engine/actions/utils";
export { Action, ActionValue, BaseAction, ValidType, UpdateDataFunction } from "@/core/engine/actions/types";

export { Datapack };
