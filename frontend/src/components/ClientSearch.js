import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, UserIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { clientService } from '../services/api';
import ClientModal from './ClientModal';

const ClientSearch = ({ selectedClient, onClientSelect, placeholder = "Buscar cliente por nome, sobrenome ou CPF..." }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  // Atualizar o searchTerm quando selectedClient muda
  useEffect(() => {
    if (selectedClient) {
      setSearchTerm(`${selectedClient.firstName} ${selectedClient.lastName}`);
    } else {
      setSearchTerm('');
    }
  }, [selectedClient]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchClients = async () => {
    setLoading(true);
    try {
      const response = await clientService.list({
        search: searchTerm,
        limit: 10,
        page: 1
      });
      setClients(response.clients || []);
      setIsOpen(true);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Se há um cliente selecionado e o searchTerm é igual ao nome do cliente,
    // não fazer busca (evita dropdown desnecessário)
    if (selectedClient && searchTerm === `${selectedClient.firstName} ${selectedClient.lastName}`) {
      setIsOpen(false);
      return;
    }
    
    if (searchTerm.length >= 1) {
      searchClients();
    } else {
      setClients([]);
      setIsOpen(false);
    }
  }, [searchTerm, selectedClient]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClientSelect = (client) => {
    setSearchTerm(`${client.firstName} ${client.lastName}`);
    setIsOpen(false);
    onClientSelect(client);
  };

  const clearSelection = () => {
    setSearchTerm('');
    setIsOpen(false);
    onClientSelect(null);
  };

  const handleCreateNewClient = () => {
    setShowClientModal(true);
    setIsOpen(false);
  };

  const handleClientCreated = (newClient) => {
    // Auto-selecionar o cliente recém-criado
    handleClientSelect(newClient);
    setShowClientModal(false);
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={searchRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            const newValue = e.target.value;
            setSearchTerm(newValue);
            
            // Se há um cliente selecionado e o usuário está mudando o texto,
            // limpar a seleção apenas se o texto for diferente do nome do cliente
            if (selectedClient && newValue !== `${selectedClient.firstName} ${selectedClient.lastName}`) {
              onClientSelect(null);
            }
          }}
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white shadow-sm transition-all duration-200"
          autoComplete="off"
        />
        
        {searchTerm && (
          <button
            type="button"
            onClick={clearSelection}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {selectedClient && (
        <div className="mt-2 p-3 bg-gold-50 border border-gold-200 rounded-lg">
          <div className="flex items-center">
            <UserIcon className="h-5 w-5 text-primary-600 mr-2" />
            <div>
              <p className="font-medium text-primary-900">
                {selectedClient.firstName} {selectedClient.lastName}
              </p>
              <p className="text-sm text-primary-700">CPF: {selectedClient.cpf}</p>
            </div>
          </div>
        </div>
      )}

      {isOpen && !selectedClient && (
        <div className="absolute z-[9999] mt-1 w-full bg-white shadow-xl max-h-60 rounded-lg py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none border border-gray-200">
          {loading ? (
            <div className="px-4 py-3 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
              <span className="ml-2">Buscando...</span>
            </div>
          ) : clients.length > 0 ? (
            clients.map((client) => (
              <div
                key={client.id}
                className="cursor-pointer select-none relative py-3 px-4 hover:bg-gold-50 transition-colors duration-150"
                onClick={() => handleClientSelect(client)}
              >
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {client.firstName} {client.lastName}
                    </p>
                    <p className="text-sm text-gray-500">CPF: {client.cpf}</p>
                  </div>
                </div>
              </div>
            ))
          ) : searchTerm.length >= 1 ? (
            <div className="px-4 py-3 text-center text-gray-500">
              <UserIcon className="h-6 w-6 mx-auto mb-2 text-gray-300" />
              <p className="mb-3">Nenhum cliente encontrado</p>
              <p className="text-xs mb-4">Tente buscar por nome, sobrenome ou CPF</p>
              <button
                type="button"
                onClick={handleCreateNewClient}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Criar Novo Cliente
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>

    {/* Modal de criação de cliente */}
    <ClientModal
      isOpen={showClientModal}
      onClose={() => setShowClientModal(false)}
      onClientCreated={handleClientCreated}
    />
  </>
  );
};

export default ClientSearch;
