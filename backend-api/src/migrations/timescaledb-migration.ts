import { DataSource } from 'typeorm';

/**
 * Migração para converter tabela metrics em hypertable do TimescaleDB
 * Execute após a primeira sincronização do TypeORM
 */
export async function convertToHypertable(dataSource: DataSource) {
  const queryRunner = dataSource.createQueryRunner();
  
  try {
    // Verificar se a extensão TimescaleDB está instalada
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS timescaledb;');
    
    // Converter tabela metrics em hypertable (se ainda não for)
    const checkHypertable = await queryRunner.query(`
      SELECT COUNT(*) as count 
      FROM timescaledb_information.hypertables 
      WHERE hypertable_name = 'metrics';
    `);
    
    if (checkHypertable[0].count === '0') {
      await queryRunner.query(`
        SELECT create_hypertable('metrics', 'timestamp', 
          chunk_time_interval => INTERVAL '1 day',
          if_not_exists => TRUE
        );
      `);
      console.log('✅ Tabela metrics convertida para hypertable do TimescaleDB');
    } else {
      console.log('ℹ️  Tabela metrics já é uma hypertable');
    }
    
    // Criar índices otimizados para TimescaleDB
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_metrics_machine_timestamp 
      ON metrics (machineId, timestamp DESC);
    `);
    
    // Criar política de retenção de dados (opcional - manter 1 ano)
    await queryRunner.query(`
      SELECT add_retention_policy('metrics', INTERVAL '365 days', if_not_exists => TRUE);
    `).catch(() => {
      // Ignora erro se política já existir
      console.log('ℹ️  Política de retenção já configurada ou não aplicável');
    });
    
  } catch (error) {
    console.error('❌ Erro ao configurar TimescaleDB:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}

