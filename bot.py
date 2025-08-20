import random


class Bot:
    """
    A bot that makes random moves.
    """

    def __init__(self):
        pass

    def get_possible_moves(self, side, board):
        return board.get_all_valid_moves(side)

    def move(self, side, board):
        moves = self.get_possible_moves(side, board)
        best_move = random.choice(moves)
        return best_move
