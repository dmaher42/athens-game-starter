import { BufferGeometry, InstancedBufferGeometry, ShaderMaterial, type ShaderMaterialParameters } from "three";
import type { TypedShaderMaterial, UniformMap } from "@app/types/global";

export function createBufferGeometry<TGeometry extends BufferGeometry = BufferGeometry>(): TGeometry {
  return new BufferGeometry() as TGeometry;
}

export function createInstancedBufferGeometry<
  TGeometry extends InstancedBufferGeometry = InstancedBufferGeometry
>(): TGeometry {
  return new InstancedBufferGeometry() as TGeometry;
}

export function createTypedShaderMaterial<TUniforms extends UniformMap>(
  params: ShaderMaterialParameters & { uniforms: TUniforms }
): TypedShaderMaterial<TUniforms> {
  return new ShaderMaterial(params) as TypedShaderMaterial<TUniforms>;
}
