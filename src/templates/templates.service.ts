import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Template } from './entities/template.entity';

@Injectable()
export class TemplatesService implements OnModuleInit {
  constructor(
    @InjectRepository(Template)
    private readonly templateRepository: Repository<Template>,
  ) {}

  async onModuleInit(): Promise<void> {
    const templates = [
      {
        slug: 'password_recovery',
        name: 'Recuperación de Clave',
        filename: 'password-recovery',
        subject: 'Restablece tu contraseña',
        isActive: true,
      },
      {
        slug: 'welcome',
        name: 'Bienvenida a la Plataforma',
        filename: 'welcome',
        subject: '¡Te damos la bienvenida!',
        isActive: true,
      },
      {
        slug: 'group_welcome',
        name: 'Bienvenida a Grupo',
        filename: 'group-welcome',
        subject: 'Nueva experiencia formativa',
        isActive: true,
      },     

      {
        slug: 'group_welcome_multiple',
        name: 'Bienvenida a Varios Grupos',
        filename: 'group-welcome-multiple',
        subject: 'Nueva experiencia formativa',
        isActive: true,
      },
     
    ];

    await this.templateRepository.upsert(templates, ['slug']);
  }

  async findBySlug(slug: string): Promise<Template | null> {
    return this.templateRepository.findOne({ where: { slug, isActive: true } });
  }
}
