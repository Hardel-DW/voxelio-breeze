import { calculateInitialToggle } from "@/core/engine/managers/InitialToggle";
import type { InterfaceConfiguration } from "@/core/schema/primitive";
import { describe, expect, test } from "vitest";

describe("Search all initial toggle sections", () => {
    test("should return correct initial toggle for one section", () => {
        const interfaces: InterfaceConfiguration[] = [
            {
                id: "lorem",
                section: "Lorem ipsum",
                components: [
                    {
                        type: "Section",
                        title: "Lorem ipsum",
                        id: "test",
                        toggle: [
                            { name: "foo", title: "Lorem ipsum", description: "Lorem ipsum" },
                            { name: "bar", title: "Lorem ipsum", description: "Lorem ipsum" }
                        ],
                        children: []
                    }
                ]
            }
        ];

        const result = calculateInitialToggle(interfaces);
        expect(result).toEqual({
            test: { name: "foo", title: "Lorem ipsum", description: "Lorem ipsum" }
        });
    });

    test("should return correct initial toggle for multiple sections", () => {
        const interfaces: InterfaceConfiguration[] = [
            {
                id: "supported",
                section: "Lorem ipsum",
                components: [
                    {
                        type: "Section",
                        title: "Lorem ipsum",
                        id: "test",
                        toggle: [
                            { name: "yup", title: "Lorem ipsum", description: "Lorem ipsum" },
                            { name: "bar", title: "Lorem ipsum", description: "Lorem ipsum" }
                        ],
                        children: []
                    }
                ]
            },
            {
                id: "supported",
                section: "Lorem ipsum",
                components: [
                    {
                        type: "Section",
                        title: "Lorem ipsum",
                        id: "test2",
                        toggle: [
                            { name: "baz", title: "Lorem ipsum", description: "Lorem ipsum" },
                            { name: "biz", title: "Lorem ipsum", description: "Lorem ipsum" }
                        ],
                        children: []
                    }
                ]
            }
        ];

        const result = calculateInitialToggle(interfaces);
        expect(result).toEqual({
            test: {
                name: "yup",
                description: "Lorem ipsum",
                title: "Lorem ipsum"
            },
            test2: {
                name: "baz",
                description: "Lorem ipsum",
                title: "Lorem ipsum"
            }
        });
    });
});
