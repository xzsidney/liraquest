import { randomUUID } from 'node:crypto';
import {
  DefinitionItem,
  Character,
  CharacterInventory,
} from '../models/index.js';

/**
 * Lista todos os itens da Loja do Reino
 */
export const getShopItems = async (req, res) => {
  try {
    const items = await DefinitionItem.findAll({
      order: [['price_gold', 'ASC']],
    });
    return res.json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    console.error('❌ Erro ao listar loja:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao consultar itens da loja.',
    });
  }
};

/**
 * Compra de item pelo herói gastando Ouro
 */
export const buyItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { item_id } = req.body;

    const hero = await Character.findOne({ where: { user_id: userId } });
    if (!hero) {
      return res.status(404).json({
        success: false,
        message: 'Você precisa de um herói para comprar na loja.',
      });
    }

    const item = await DefinitionItem.findByPk(item_id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item não encontrado na loja.',
      });
    }

    if (hero.gold < item.price_gold) {
      return res.status(400).json({
        success: false,
        message: `Ouro insuficiente! Você possui 💰 ${hero.gold}, mas o item custa 💰 ${item.price_gold}.`,
      });
    }

    // Deduzir ouro do herói
    await hero.update({ gold: hero.gold - item.price_gold });

    // Adicionar ao inventário (se já existe, incrementa quantidade)
    let inventoryItem = await CharacterInventory.findOne({
      where: { character_id: hero.id, item_id: item.id },
    });

    if (inventoryItem) {
      await inventoryItem.update({ quantity: inventoryItem.quantity + 1 });
    } else {
      inventoryItem = await CharacterInventory.create({
        id: randomUUID().toLowerCase(),
        character_id: hero.id,
        item_id: item.id,
        quantity: 1,
        is_equipped: false,
      });
    }

    return res.json({
      success: true,
      message: `🎉 Você comprou "${item.name}" por 💰 ${item.price_gold} Ouro!`,
      newGold: hero.gold,
      item,
    });
  } catch (error) {
    console.error('❌ Erro ao comprar item:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao processar compra.',
    });
  }
};
