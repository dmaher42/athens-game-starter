import { BufferGeometry, InstancedBufferGeometry, ShaderMaterial } from "three";
export function createBufferGeometry() {
    return new BufferGeometry();
}
export function createInstancedBufferGeometry() {
    return new InstancedBufferGeometry();
}
export function createTypedShaderMaterial(params) {
    return new ShaderMaterial(params);
}
