import { Apoderado, TipoParentesco, VinculoAlumno } from '../entities/apoderado.entity';

export const APODERADO_REPOSITORY = 'ApoderadoRepository';

export interface CrearApoderadoProps {
  personaId: string;
}

export interface CrearApoderadoConPersonaProps {
  dni:       string;
  nombres:   string;
  apellidos: string;
  telefono?: string;
  fechaNac:  Date;
  genero:    'MASCULINO' | 'FEMENINO' | 'OTRO';
}

export interface ApoderadoRepository {
  crear(props: CrearApoderadoProps):                              Promise<Apoderado>;
  crearConPersona(props: CrearApoderadoConPersonaProps):          Promise<Apoderado>;
  buscarPorId(id: string):                                        Promise<Apoderado | null>;
  buscarPorDni(dni: string):                                      Promise<Apoderado | null>;
  buscarPorPersonaId(personaId: string):                          Promise<Apoderado | null>;
  listarPorAlumno(alumnoId: string):                              Promise<Array<Apoderado & { parentesco: TipoParentesco }>>;
  listarPorColegio(colegioId: string):                            Promise<Apoderado[]>;
  asignarAlumno(apoderadoId: string, alumnoId: string, parentesco: TipoParentesco): Promise<VinculoAlumno>;
  desvincularAlumno(apoderadoId: string, alumnoId: string):       Promise<void>;
  contarVinculosPorAlumno(alumnoId: string):                      Promise<number>;
  existeVinculo(apoderadoId: string, alumnoId: string):           Promise<boolean>;
  existeParentescoPorAlumno(alumnoId: string, parentesco: TipoParentesco): Promise<boolean>;
}
