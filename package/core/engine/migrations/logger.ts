import { Identifier } from "../../Identifier.ts";
import { ENGINE_VERSION } from "../../Version.ts";
import type { Analysers, GetAnalyserVoxel } from "../Analyser.ts";
import type { Action, ActionValue } from "../actions/index.ts";
import { createDifferenceFromAction } from "./logValidation.ts";
import type {
	FileLog,
	FileLogUpdated,
	Log,
	LogDifference,
	LogValue,
} from "./types.ts";

export class Logger {
	private readonly log: Log;
	private readonly engine: number;

	constructor(log: Log, engine: number = ENGINE_VERSION) {
		this.log = log;
		this.engine = engine;
	}

	public getEngine(): number {
		return this.engine;
	}

	public getVersion(): number {
		return this.log.version;
	}

	public getLogs(): Log {
		return this.log;
	}

	// Trouve ou crée un FileLog pour un identifiant donné
	private findOrCreateFileLog(identifier: string, registry: string): FileLog {
		let fileLog = this.log.logs.find((log) => log.identifier === identifier);

		if (!fileLog) {
			fileLog = { identifier, registry, type: "updated", differences: [] };
			this.log.logs.push(fileLog);
		}

		return fileLog;
	}

	// Ajoute ou met à jour une différence
	public logDifference(
		identifier: string,
		registry: string,
		difference: LogDifference | LogDifference[],
	) {
		const fileLog = this.findOrCreateFileLog(identifier, registry);

		if (fileLog.type !== "updated") {
			return;
		}

		// Si c'est un tableau de différences, on les traite une par une
		if (Array.isArray(difference)) {
			for (const diff of difference) {
				this.handleSingleDifference(fileLog as FileLogUpdated, diff);
			}
		} else {
			this.handleSingleDifference(fileLog as FileLogUpdated, difference);
		}
	}

	private handleSingleDifference(
		fileLog: FileLogUpdated,
		difference: LogDifference,
	) {
		const existingDiffIndex = fileLog.differences.findIndex(
			(diff: LogDifference) => diff.path === difference.path,
		);

		if (existingDiffIndex !== -1) {
			if (difference.type === "remove") {
				fileLog.differences.splice(existingDiffIndex, 1);
			} else {
				fileLog.differences[existingDiffIndex] = difference;
			}
		} else if (difference.type !== "remove") {
			fileLog.differences.push(difference);
		}
	}

	// Ajouter une nouvelle méthode pour récupérer la valeur originale
	public getOriginalValue(
		identifier: string,
		field: string,
	): LogValue | undefined {
		const fileLog = this.log.logs.find((log) => log.identifier === identifier);
		if (fileLog && fileLog.type === "updated") {
			const difference = fileLog.differences.find(
				(diff) => diff.path === field,
			);
			return difference?.type === "set" ? difference.origin_value : undefined;
		}
		return undefined;
	}

	public handleActionDifference<T extends keyof Analysers>(
		action: Action,
		element: GetAnalyserVoxel<T>,
		tool: T,
		value?: ActionValue,
		version: number = Number.POSITIVE_INFINITY,
	): void {
		const difference = createDifferenceFromAction(
			action,
			element,
			version,
			tool,
			this,
			value,
		);
		if (difference) {
			this.logDifference(
				new Identifier(element.identifier).toString(),
				element.identifier.registry || "unknown",
				difference,
			);
		}
	}

	public serialize(minified = false) {
		return JSON.stringify(
			{ ...this.getLogs(), engine: this.getEngine() },
			null,
			minified ? 0 : 4,
		);
	}
}
