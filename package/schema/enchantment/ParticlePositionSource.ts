export interface ParticlePositionSource {
    type: "entity_position" | "in_bounding_box";
    offset?: number;
    entity_position?: { scale?: number };
}
