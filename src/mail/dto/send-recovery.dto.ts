import { IsEmail, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class SendRecoveryDto {
  @IsEmail({}, { message: 'El email proporcionado no es válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  name: string;

  @IsUrl({}, { message: 'La URL proporcionada no es válida' })
  @IsNotEmpty({ message: 'La URL de recuperación es requerida' })
  url: string;
}
