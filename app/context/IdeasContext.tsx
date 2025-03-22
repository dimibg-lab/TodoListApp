import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

export interface Idea {
  id: string;
  title: string;
  description: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface IdeasContextType {
  ideas: Idea[];
  loadIdeas: () => Promise<void>;
  addIdea: (idea: Omit<Idea, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateIdea: (id: string, idea: Partial<Idea>) => Promise<void>;
  deleteIdea: (id: string) => Promise<void>;
  getIdeaById: (id: string) => Idea | undefined;
}

const IdeasContext = createContext<IdeasContextType | undefined>(undefined);

export const useIdeas = () => {
  const context = useContext(IdeasContext);
  if (!context) {
    throw new Error('useIdeas must be used within an IdeasProvider');
  }
  return context;
};

export const IdeasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ideas, setIdeas] = useState<Idea[]>([]);

  const loadIdeas = async () => {
    try {
      const storedIdeas = await AsyncStorage.getItem('ideas');
      if (storedIdeas) {
        setIdeas(JSON.parse(storedIdeas));
      }
    } catch (error) {
      console.error('Грешка при зареждане на идеите:', error);
    }
  };

  const saveIdeas = async (newIdeas: Idea[]) => {
    try {
      await AsyncStorage.setItem('ideas', JSON.stringify(newIdeas));
    } catch (error) {
      console.error('Грешка при запазване на идеите:', error);
    }
  };

  useEffect(() => {
    loadIdeas();
  }, []);

  const addIdea = async (newIdea: Omit<Idea, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const idea: Idea = {
      ...newIdea,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };

    const updatedIdeas = [...ideas, idea];
    setIdeas(updatedIdeas);
    await saveIdeas(updatedIdeas);
  };

  const updateIdea = async (id: string, updatedFields: Partial<Idea>) => {
    const updatedIdeas = ideas.map(idea =>
      idea.id === id
        ? {
            ...idea,
            ...updatedFields,
            updatedAt: new Date().toISOString(),
          }
        : idea
    );
    setIdeas(updatedIdeas);
    await saveIdeas(updatedIdeas);
  };

  const deleteIdea = async (id: string) => {
    const updatedIdeas = ideas.filter(idea => idea.id !== id);
    setIdeas(updatedIdeas);
    await saveIdeas(updatedIdeas);
  };

  const getIdeaById = (id: string) => {
    return ideas.find(idea => idea.id === id);
  };

  return (
    <IdeasContext.Provider
      value={{
        ideas,
        loadIdeas,
        addIdea,
        updateIdea,
        deleteIdea,
        getIdeaById,
      }}
    >
      {children}
    </IdeasContext.Provider>
  );
}; 