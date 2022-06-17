import React from 'react';
import ProjectsForfait from "../../pages/ProjectsForfait";
import TestRenderer from 'react-test-renderer';
import ReactDOM from 'react-dom'
import { Provider as ProjectProvider } from "../../context/ProjectContext";
import { render, act, fireEvent } from "@testing-library/react";

const projectContextValue = {
  state: {
    forfait: {
      "projects": [
        {
          "name": "Client 1",
          "key": "CLI5192",
          "times": {
            "workedHours": 4,
            "estimatedHours": 8,
            "percentage": 50,
            "delta": 4,
            "isOver": false
          }
        },
        {
          "name": "Client 2",
          "key": "CLI975",
          "times": {
            "workedHours": 5.5,
            "estimatedHours": 0,
            "percentage": null,
            "delta": -5.5,
            "isOver": true
          }
        },
        {
          "name": "Client 3",
          "key": "CLI3167",
          "times": {
            "workedHours": 90.5,
            "estimatedHours": 0,
            "percentage": null,
            "delta": -90.5,
            "isOver": true
          }
        },
      ],
      "lastSync": "23/01/2022, 19:47:49"
    },
    projectsCategoriesList : []
  },
  getProjectsForfait: jest.fn(),
  setSelectedCategory: jest.fn(),
};

const projectContextValueEmpty = {
  state: {
    forfait: null,
  }, getProjectsForfait: jest.fn(),
  setSelectedCategory: jest.fn()
};

jest.mock('../../services/project.service', () => ({
  fetchPorjectsCategories: () => {return {data :[]}}
}));

jest.mock('react-router', () => ({
  useHistory:() =>{return [];}
}));


React.useRef = () => {
  return {
    current: [
      {
        "id": 2,
        "Name": "Montreal - Internal",
      },
      {
        "id": 4,
        "Name": "Montreal - Projects",
      },
      {
        "id": 3,
        "Name": "Montreal - Presales",
      },
      {
        "id": 1,
        "Name": "Montreal - Consulting",
      },
      {
        "id": 7,
        "Name": "Montreal - R&D",
      },
      {
        "id": 8,
        "Name": "Montreal - Escouade",
      }
    ]
  }
}

//jest.spyOn(React,'useState').mockImplementation((useState) => [["cat1","cat2",],jest.fn()])
//React.useState = () => {return {projectsCategoriesList: ["cat1","cat2",],setProjectsCategoriesList: jest.fn()}}//

const testInstance = TestRenderer.create(<ProjectProvider value={projectContextValue}><ProjectsForfait /></ProjectProvider>).root;

describe('The projectsForfait component', () => {
  it('contains buttons', () => {
    expect(testInstance.findAllByType('button').length).toBe(8);
  });

  it('contains select', () => {
    expect(testInstance.findAllByType('select').length).toBe(2);
    expect(testInstance.findAllByType('option').length).toBe(12);
  });

  it('tests the elements surrounding the projects forfait table', () => {

    //Act
    const res = render(<ProjectProvider value={projectContextValue}> <ProjectsForfait /> </ProjectProvider>);
    //Assert
    expect(res.getByText('Dernière synchronisation : 23/01/2022, 19:47:49')).toBeInTheDocument();
    expect(res.getByText('Projets Forfait')).toBeInTheDocument();
  });

  it('tests the elements of the projects forfait page without data', () => {

    const res = render(<ProjectProvider value={projectContextValueEmpty}> <ProjectsForfait /> </ProjectProvider>);
    //Assert
    expect(res.getByText('Loading...')).toBeInTheDocument();

  });

  it('contains the right element in the header', () => {
    //Arrange
    const expectedResults = [
      "Client",
      "Période",
      "Flag",
      "Estimé",
      "Utilisation",
      "Delta",
      "%",
      "Détails",
    ]
    //Act
    let headerArray = [];
    const res = render(<ProjectProvider value={projectContextValue}> <ProjectsForfait /> </ProjectProvider>);
    let columnHeaders = res.getAllByRole('columnheader');
    for (let index = 0; index < columnHeaders.length; index++) {
      headerArray.push(columnHeaders[index].textContent);
    }
    //Assert
    expect(headerArray).toEqual(expectedResults);
  });

  it('contains the right elements in the table\'s body', () => {
    //Arrange
    const expectedResults = [
      "Client 1",
      "",
      "",
      "8h",
      "4h",
      "4h",
      "50 %",
      " Détails",
      "Client 2",
      "",
      "",
      "0h",
      "6h",
      "-6h",
      "0 %",
      " Détails",
      "Client 3",
      "",
      "",
      "0h",
      "91h",
      "-91h",
      "0 %",
      " Détails",
    ]
    //Act
    let cellValues = [];
    let res ;
    //act(() => {
      res = render(<ProjectProvider value={projectContextValue}> <ProjectsForfait /> </ProjectProvider>);
   // });
    let cells = res.getAllByRole('cell');
    for (let index = 0; index < cells.length; index++) {
      cellValues.push(cells[index].textContent);
    }
    //Assert
    expect(cellValues).toEqual(expectedResults);
  });

  it('should call getProjectsForfait() 2 times, one at the beginning and one when we click on the refresh button', async () => {

    //Act
    const res = render(<ProjectProvider value={projectContextValue}> <ProjectsForfait /> </ProjectProvider>);
    await act(async () => {
      fireEvent(
        res.getByTestId('refresh-button'),
        new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
        })
      );
    });
    expect(projectContextValue.getProjectsForfait).toHaveBeenCalledTimes(2); //we can't test the params because of the callback
  });

  it('should call setSelectedCategory and getProjectsForfait(), when we select a category', async () => {

    //Act
    const res = render(<ProjectProvider value={projectContextValue}> <ProjectsForfait /> </ProjectProvider>);
    await act(async () => {
      fireEvent(
        res.getByTestId('select-category'),
        new MouseEvent('change', {
          bubbles: true,
          cancelable: true,
          event: {target: {value: "Montreal - Projects"}}
        })
      );/*
      fireEvent(
        res.getAllByRole('option')[2],
        new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
        })
      );*/
    });
    //expect(projectContextValue.setSelectedCategory).toHaveBeenCalledWith("Montreal - Projects"); //we can't test the params because of the callback
    expect(projectContextValue.setSelectedCategory).toHaveBeenCalledTimes(1); 
   
    expect(projectContextValue.getProjectsForfait).toHaveBeenCalledTimes(2); //we can't test the params because of the callback
  });
})
