export type LogValue = string | number | boolean | Array<string | number | boolean> | Record<string, unknown>;

export type FieldLogDifferenceBase = {
    path: string;
};

export type FieldLogDifferenceSet = FieldLogDifferenceBase & {
    type: "set";
    value: LogValue;
    origin_value: LogValue;
};

export type FieldLogDifferenceAdd = FieldLogDifferenceBase & {
    type: "add";
    value: LogValue;
};

export type FieldLogDifferenceRemove = FieldLogDifferenceBase & {
    type: "remove";
};

export type LogDifference = FieldLogDifferenceSet | FieldLogDifferenceAdd | FieldLogDifferenceRemove;

export type FileLogBase = {
    identifier: string;
    registry: string;
};

export type FileLogUpdated = FileLogBase & {
    type: "updated";
    differences: LogDifference[];
};

export type FileLogDeleted = FileLogBase & {
    type: "deleted";
};

export type FileLogAdded = FileLogBase & {
    type: "added";
    value: LogValue;
};

export type FileLog = FileLogUpdated | FileLogDeleted | FileLogAdded;

export type DatapackInfo = {
    name: string;
    description: string;
    namespaces: string[];
};

export type Log = {
    id: string;
    date: string;
    version: number;
    isModded: boolean;
    datapack: DatapackInfo;
    isMinified: boolean;
    logs: FileLog[];
};

/*
/!**
 * Explanation :
 * - Lors d'une actions utilisateurs, ont regarde si l'identifer existe déjà si oui ont regarde si le field existe.
 * - Si le field existe ont met a jour l'objet.
 * - Si le field n'existe pas ont l'ajoute.
 * - Si le field existe mais que l'utilisateur a supprimer le chammp, ont retire difference.
 *
 * On ne modifie uniquement les prmitives: String, Number, Boolean, Array.
 * Ont peut rajouter avec les primitives: String, Number, Boolean, Array, Object.
 *!/
const exemple: Log = {
	sourceVersion: 10,
	targetVersion: 11,
	datapack: {
		name: "example",
		description: "Example datapack",
		namespaces: ["minecraft", "example"],
	},
	isMinified: false,
	logs: [
		{
			identifier: "example:foo",
			registry: "loot_table",
			type: "updated",
			differences: [
				{
					path: "example_field.example_field[{id:hey}].image",
					type: "set",
					value: "foo",
					origin_value: "bar",
				},
				{
					path: "example_field",
					type: "add",
					value: "foo",
				},
				{
					path: "example_field",
					type: "remove",
				},
			],
		},
		{
			identifier: "example:bar",
			registry: "loot_table",
			type: "deleted",
		},
		{
			identifier: "example:baz",
			registry: "loot_table",
			type: "added",
			value: "foo",
		},
	],
};*/
